package com.idoldiary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReminderSubscribeRequest {
    @NotNull(message = "爱豆ID不能为空")
    private Long idolId;

    @NotBlank(message = "提醒来源不能为空")
    private String sourceKey;

    @NotBlank(message = "提醒来源类型不能为空")
    private String sourceType;

    @NotBlank(message = "提醒标题不能为空")
    private String title;

    @NotBlank(message = "提醒日期不能为空")
    private String date;

    public Long getIdolId() { return idolId; }
    public void setIdolId(Long idolId) { this.idolId = idolId; }
    public String getSourceKey() { return sourceKey; }
    public void setSourceKey(String sourceKey) { this.sourceKey = sourceKey; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
