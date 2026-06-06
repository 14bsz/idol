package com.idoldiary.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.idoldiary.config.WechatConfig;
import com.idoldiary.dto.LoginRequest;
import com.idoldiary.dto.LoginResponse;
import com.idoldiary.dto.WechatLoginResponse;
import com.idoldiary.entity.User;
import com.idoldiary.mapper.UserMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService extends ServiceImpl<UserMapper, User> {

    private final WechatConfig wechatConfig;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public LoginResponse login(LoginRequest request) {
        String url = String.format(
                "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                wechatConfig.getAppId(),
                wechatConfig.getAppSecret(),
                request.getCode()
        );

        try {
            String response = restTemplate.getForObject(url, String.class);
            WechatLoginResponse wechatResponse = objectMapper.readValue(response, WechatLoginResponse.class);

            if (wechatResponse.getErrcode() != null && wechatResponse.getErrcode() != 0) {
                throw new RuntimeException("微信登录失败: " + wechatResponse.getErrmsg());
            }

            String openid = wechatResponse.getOpenid();

            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getOpenid, openid);
            User user = this.getOne(wrapper);

            if (user == null) {
                user = new User();
                user.setOpenid(openid);
                user.setNickname("爱豆粉丝");
                this.save(user);
            }

            StpUtil.login(user.getId());
            String token = StpUtil.getTokenValue();

            return new LoginResponse(token, user.getId(), user.getNickname(), user.getAvatarUrl());
        } catch (Exception e) {
            log.error("登录失败", e);
            throw new RuntimeException("登录失败: " + e.getMessage());
        }
    }

    public User getCurrentUser() {
        Long userId = StpUtil.getLoginIdAsLong();
        return this.getById(userId);
    }

    public User updateUser(User user) {
        Long userId = StpUtil.getLoginIdAsLong();
        user.setId(userId);
        this.updateById(user);
        return this.getById(userId);
    }
}
