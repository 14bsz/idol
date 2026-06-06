package com.idoldiary.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
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
}
