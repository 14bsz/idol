package com.idoldiary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
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
}
