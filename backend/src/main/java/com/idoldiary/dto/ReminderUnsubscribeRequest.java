package com.idoldiary.dto;

import jakarta.validation.constraints.NotBlank;

public class ReminderUnsubscribeRequest {
    @NotBlank(message = "提醒来源不能为空")
    private String sourceKey;

    @NotBlank(message = "提醒来源类型不能为空")
    private String sourceType;

    public String getSourceKey() { return sourceKey; }
    public void setSourceKey(String sourceKey) { this.sourceKey = sourceKey; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
}
