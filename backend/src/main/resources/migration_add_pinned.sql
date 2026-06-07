-- 添加日记置顶功能
-- 为 diary 表添加 pinned 字段

USE idol_diary;

-- 添加置顶字段
ALTER TABLE `diary` 
ADD COLUMN `pinned` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶 0-否 1-是' AFTER `tags`;

-- 添加索引以优化置顶日记的查询
ALTER TABLE `diary` 
ADD INDEX `idx_pinned_created_at` (`pinned`, `created_at` DESC);

-- 说明：
-- 1. pinned 字段：0表示普通日记，1表示置顶日记
-- 2. 复合索引 idx_pinned_created_at 可以加速按置顶+时间排序的查询
-- 3. 查询时应该先按 pinned DESC 排序（置顶的在前），再按 created_at DESC 排序（最新的在前）
