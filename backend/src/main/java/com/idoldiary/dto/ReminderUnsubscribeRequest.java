package com.idoldiary.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReminderUnsubscribeRequest {
    @NotBlank(message = "提醒来源不能为空")
    private String sourceKey;

    @NotBlank(message = "提醒来源类型不能为空")
    private String sourceType;
}
