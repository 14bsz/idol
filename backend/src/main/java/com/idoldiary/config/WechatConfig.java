package com.idoldiary.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "wechat.mini-program")
public class WechatConfig {
    private String appId;
    private String appSecret;
    private String subscribeTemplateId;
    private String subscribeTemplateNo;
    private String subscribeTemplateTitle;
    private String subscribeCategory;
    private String subscribeKeywords;
    private String subscribeType;
    private String subscribeSceneDescription;
    private String subscribeOperator;
    private String subscribePage;
    private String subscribeTitleKey;
    private String subscribeDateKey;
    private String subscribeRemarkKey;

    public String getAppId() { return appId; }
    public void setAppId(String appId) { this.appId = appId; }
    public String getAppSecret() { return appSecret; }
    public void setAppSecret(String appSecret) { this.appSecret = appSecret; }
    public String getSubscribeTemplateId() { return subscribeTemplateId; }
    public void setSubscribeTemplateId(String subscribeTemplateId) { this.subscribeTemplateId = subscribeTemplateId; }
    public String getSubscribeTemplateNo() { return subscribeTemplateNo; }
    public void setSubscribeTemplateNo(String subscribeTemplateNo) { this.subscribeTemplateNo = subscribeTemplateNo; }
    public String getSubscribeTemplateTitle() { return subscribeTemplateTitle; }
    public void setSubscribeTemplateTitle(String subscribeTemplateTitle) { this.subscribeTemplateTitle = subscribeTemplateTitle; }
    public String getSubscribeCategory() { return subscribeCategory; }
    public void setSubscribeCategory(String subscribeCategory) { this.subscribeCategory = subscribeCategory; }
    public String getSubscribeKeywords() { return subscribeKeywords; }
    public void setSubscribeKeywords(String subscribeKeywords) { this.subscribeKeywords = subscribeKeywords; }
    public String getSubscribeType() { return subscribeType; }
    public void setSubscribeType(String subscribeType) { this.subscribeType = subscribeType; }
    public String getSubscribeSceneDescription() { return subscribeSceneDescription; }
    public void setSubscribeSceneDescription(String subscribeSceneDescription) { this.subscribeSceneDescription = subscribeSceneDescription; }
    public String getSubscribeOperator() { return subscribeOperator; }
    public void setSubscribeOperator(String subscribeOperator) { this.subscribeOperator = subscribeOperator; }
    public String getSubscribePage() { return subscribePage; }
    public void setSubscribePage(String subscribePage) { this.subscribePage = subscribePage; }
    public String getSubscribeTitleKey() { return subscribeTitleKey; }
    public void setSubscribeTitleKey(String subscribeTitleKey) { this.subscribeTitleKey = subscribeTitleKey; }
    public String getSubscribeDateKey() { return subscribeDateKey; }
    public void setSubscribeDateKey(String subscribeDateKey) { this.subscribeDateKey = subscribeDateKey; }
    public String getSubscribeRemarkKey() { return subscribeRemarkKey; }
    public void setSubscribeRemarkKey(String subscribeRemarkKey) { this.subscribeRemarkKey = subscribeRemarkKey; }
}
