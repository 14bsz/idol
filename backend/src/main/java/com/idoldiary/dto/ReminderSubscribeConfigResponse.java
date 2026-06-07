package com.idoldiary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReminderSubscribeConfigResponse {
    private Boolean enabled;
    private String templateId;
    private String templateNo;
    private String title;
    private String category;
    private String keywords;
    private String type;
    private String sceneDescription;
    private String operator;
}
