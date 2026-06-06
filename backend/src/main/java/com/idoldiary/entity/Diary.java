package com.idoldiary.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@TableName("diary")
public class Diary {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long idolId;

    private String content;

    private String images;

    private String mood;

    private String template;

    private String tags;

    private LocalDate createdAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getIdolId() { return idolId; }
    public void setIdolId(Long idolId) { this.idolId = idolId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }
    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
    public Integer getDeleted() { return deleted; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }
}