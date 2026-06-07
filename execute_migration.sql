USE idol_diary;
ALTER TABLE `diary` ADD COLUMN `pinned` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶 0-否 1-是' AFTER `tags`;
ALTER TABLE `diary` ADD INDEX `idx_pinned_created_at` (`pinned`, `created_at` DESC);
