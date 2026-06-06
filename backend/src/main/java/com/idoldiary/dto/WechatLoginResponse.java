package com.idoldiary.dto;

import lombok.Data;

@Data
public class WechatLoginResponse {
    private String openid;
    private String sessionKey;
    private String unionid;
    private Integer errcode;
    private String errmsg;
}
