package com.idoldiary.dto;

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

    public ReminderSubscribeConfigResponse() {}

    public ReminderSubscribeConfigResponse(Boolean enabled, String templateId, String templateNo, String title, String category, String keywords, String type, String sceneDescription, String operator) {
        this.enabled = enabled;
        this.templateId = templateId;
        this.templateNo = templateNo;
        this.title = title;
        this.category = category;
        this.keywords = keywords;
        this.type = type;
        this.sceneDescription = sceneDescription;
        this.operator = operator;
    }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public String getTemplateId() { return templateId; }
    public void setTemplateId(String templateId) { this.templateId = templateId; }
    public String getTemplateNo() { return templateNo; }
    public void setTemplateNo(String templateNo) { this.templateNo = templateNo; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSceneDescription() { return sceneDescription; }
    public void setSceneDescription(String sceneDescription) { this.sceneDescription = sceneDescription; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
}
