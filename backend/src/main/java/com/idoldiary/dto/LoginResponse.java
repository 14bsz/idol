package com.idoldiary.dto;

public class LoginResponse {
    private String token;
    private Long userId;
    private String nickname;
    private String avatarUrl;

    public LoginResponse() {}

    public LoginResponse(String token, Long userId, String nickname, String avatarUrl) {
        this.token = token;
        this.userId = userId;
        this.nickname = nickname;
        this.avatarUrl = avatarUrl;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
