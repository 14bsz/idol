package com.idoldiary.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@TableName("collection")
public class Collect {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long idolId;

    private String imageUrl;

    private String category;

    private String notes;

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
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
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
