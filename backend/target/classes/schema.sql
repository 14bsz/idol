-- 爱豆时光日记数据库表结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS idol_diary DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE idol_diary;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `openid` VARCHAR(100) NOT NULL COMMENT '微信openid',
    `nickname` VARCHAR(100) DEFAULT NULL COMMENT '昵称',
    `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_openid` (`openid`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 爱豆表
CREATE TABLE IF NOT EXISTS `idol` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '爱豆ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '爱豆姓名',
    `nickname` VARCHAR(100) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `banner_image` VARCHAR(500) DEFAULT NULL COMMENT '横幅图片URL',
    `support_color` VARCHAR(20) DEFAULT '#FFC0CB' COMMENT '应援色',
    `debut_date` DATE DEFAULT NULL COMMENT '出道日期',
    `birthday` DATE DEFAULT NULL COMMENT '生日',
    `entry_date` DATE DEFAULT NULL COMMENT '入坑日期',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爱豆表';

-- 3. 日记表
CREATE TABLE IF NOT EXISTS `diary` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日记ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `idol_id` BIGINT NOT NULL COMMENT '爱豆ID',
    `content` TEXT NOT NULL COMMENT '日记内容',
    `images` JSON DEFAULT NULL COMMENT '图片列表JSON',
    `mood` VARCHAR(20) DEFAULT 'heart' COMMENT '心情 heart/excited/healing/missing/crying',
    `template` VARCHAR(20) DEFAULT 'default' COMMENT '模板 default/serif/bold',
    `tags` JSON DEFAULT NULL COMMENT '标签列表JSON',
    `created_at` DATE NOT NULL COMMENT '日记日期',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_idol_id` (`idol_id`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日记表';

-- 4. 收藏表
CREATE TABLE IF NOT EXISTS `collection` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `idol_id` BIGINT NOT NULL COMMENT '爱豆ID',
    `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
    `category` VARCHAR(50) NOT NULL COMMENT '分类 神图/小卡/物料/语录',
    `notes` TEXT DEFAULT NULL COMMENT '备注',
    `created_at` DATE NOT NULL COMMENT '收藏日期',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_idol_id` (`idol_id`),
    KEY `idx_category` (`category`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 5. 纪念日表
CREATE TABLE IF NOT EXISTS `anniversary` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '纪念日ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `idol_id` BIGINT NOT NULL COMMENT '爱豆ID',
    `title` VARCHAR(100) NOT NULL COMMENT '标题',
    `date` DATE NOT NULL COMMENT '日期',
    `icon_text` VARCHAR(10) COMMENT '自定义图标文字',
    `color` VARCHAR(20) DEFAULT '#FFB6C1' COMMENT '颜色',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_idol_id` (`idol_id`),
    KEY `idx_date` (`date`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='纪念日表';

-- 6. 微信订阅提醒表
CREATE TABLE IF NOT EXISTS `reminder_subscription` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订阅ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `idol_id` BIGINT NOT NULL COMMENT '爱豆ID',
    `source_key` VARCHAR(64) NOT NULL COMMENT '提醒来源标识 birthday/debut/custom-123',
    `source_type` VARCHAR(20) NOT NULL COMMENT '提醒来源类型 builtin/custom',
    `title` VARCHAR(100) NOT NULL COMMENT '提醒标题',
    `remind_month` TINYINT NOT NULL COMMENT '提醒月份',
    `remind_day` TINYINT NOT NULL COMMENT '提醒日期',
    `template_id` VARCHAR(100) NOT NULL COMMENT '订阅消息模板ID',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1-启用 0-停用',
    `last_subscribed_at` DATETIME DEFAULT NULL COMMENT '最近订阅时间',
    `last_sent_year` INT DEFAULT NULL COMMENT '最近发送年份',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_source_key` (`user_id`, `source_key`),
    KEY `idx_idol_id` (`idol_id`),
    KEY `idx_remind_date` (`remind_month`, `remind_day`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='微信订阅提醒表';
