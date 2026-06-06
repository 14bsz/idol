package com.idoldiary.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;

@TableName("reminder_subscription")
public class ReminderSubscription {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long idolId;

    private String sourceKey;

    private String sourceType;

    private String title;

    private Integer remindMonth;

    private Integer remindDay;

    private String templateId;

    private Integer status;

    private LocalDateTime lastSubscribedAt;

    private Integer lastSentYear;

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
    public String getSourceKey() { return sourceKey; }
    public void setSourceKey(String sourceKey) { this.sourceKey = sourceKey; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Integer getRemindMonth() { return remindMonth; }
    public void setRemindMonth(Integer remindMonth) { this.remindMonth = remindMonth; }
    public Integer getRemindDay() { return remindDay; }
    public void setRemindDay(Integer remindDay) { this.remindDay = remindDay; }
    public String getTemplateId() { return templateId; }
    public void setTemplateId(String templateId) { this.templateId = templateId; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public LocalDateTime getLastSubscribedAt() { return lastSubscribedAt; }
    public void setLastSubscribedAt(LocalDateTime lastSubscribedAt) { this.lastSubscribedAt = lastSubscribedAt; }
    public Integer getLastSentYear() { return lastSentYear; }
    public void setLastSentYear(Integer lastSentYear) { this.lastSentYear = lastSentYear; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
    public Integer getDeleted() { return deleted; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }
}
