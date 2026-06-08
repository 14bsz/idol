-- ========================================
-- 云托管环境数据库完整迁移脚本
-- 执行前请先备份数据库！
-- ========================================

USE idol_diary;

-- ========================================
-- 1. 备份现有数据（可选但推荐）
-- ========================================
-- CREATE TABLE diary_backup AS SELECT * FROM diary;
-- CREATE TABLE collection_backup AS SELECT * FROM collection;

-- ========================================
-- 2. diary 表：添加置顶功能
-- ========================================

-- 检查 pinned 字段是否已存在
SET @exist := (SELECT COUNT(*) 
               FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'idol_diary' 
               AND TABLE_NAME = 'diary' 
               AND COLUMN_NAME = 'pinned');

-- 如果不存在，则添加 pinned 字段
SET @sql := IF(@exist = 0,
    'ALTER TABLE `diary` ADD COLUMN `pinned` TINYINT NOT NULL DEFAULT 0 COMMENT ''是否置顶 0-否 1-是'' AFTER `tags`',
    'SELECT ''pinned 字段已存在，跳过'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加索引
SET @index_exist := (SELECT COUNT(*) 
                     FROM information_schema.STATISTICS 
                     WHERE TABLE_SCHEMA = 'idol_diary' 
                     AND TABLE_NAME = 'diary' 
                     AND INDEX_NAME = 'idx_pinned_created_at');

SET @sql := IF(@index_exist = 0,
    'ALTER TABLE `diary` ADD INDEX `idx_pinned_created_at` (`pinned`, `created_at` DESC)',
    'SELECT ''idx_pinned_created_at 索引已存在，跳过'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 3. collection 表：添加 tags 字段
-- ========================================

-- 检查 tags 字段是否已存在
SET @exist := (SELECT COUNT(*) 
               FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'idol_diary' 
               AND TABLE_NAME = 'collection' 
               AND COLUMN_NAME = 'tags');

-- 如果不存在，则添加 tags 字段
SET @sql := IF(@exist = 0,
    'ALTER TABLE `collection` ADD COLUMN `tags` VARCHAR(500) DEFAULT ''[]'' COMMENT ''标签，JSON 数组格式'' AFTER `notes`',
    'SELECT ''collection.tags 字段已存在，跳过'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 4. 验证迁移结果
-- ========================================

-- 查看 diary 表结构（应该包含 pinned 字段）
SELECT 'diary 表结构：' AS '';
DESC diary;

-- 查看 diary 表索引（应该包含 idx_pinned_created_at）
SELECT 'diary 表索引：' AS '';
SHOW INDEX FROM diary;

-- 查看 collection 表结构（应该包含 tags 字段）
SELECT 'collection 表结构：' AS '';
DESC collection;

-- 统计信息
SELECT 'diary 表记录数：' AS '', COUNT(*) AS count FROM diary;
SELECT 'collection 表记录数：' AS '', COUNT(*) AS count FROM collection;

-- ========================================
-- 迁移完成！
-- ========================================
