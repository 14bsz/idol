package com.idoldiary.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.idoldiary.config.WechatConfig;
import com.idoldiary.dto.ReminderSubscribeConfigResponse;
import com.idoldiary.dto.ReminderSubscribeRequest;
import com.idoldiary.entity.ReminderSubscription;
import com.idoldiary.entity.User;
import com.idoldiary.mapper.ReminderSubscriptionMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReminderSubscriptionService extends ServiceImpl<ReminderSubscriptionMapper, ReminderSubscription> {

    private static final DateTimeFormatter REMINDER_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd 09:00");

    private final WechatConfig wechatConfig;
    private final UserService userService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    private volatile String cachedAccessToken;
    private volatile long accessTokenExpireAt;

    public ReminderSubscribeConfigResponse getSubscribeConfig() {
        boolean enabled = StringUtils.hasText(wechatConfig.getSubscribeTemplateId());
        return new ReminderSubscribeConfigResponse(
                enabled,
                enabled ? wechatConfig.getSubscribeTemplateId() : "",
                wechatConfig.getSubscribeTemplateNo(),
                wechatConfig.getSubscribeTemplateTitle(),
                wechatConfig.getSubscribeCategory(),
                wechatConfig.getSubscribeKeywords(),
                wechatConfig.getSubscribeType(),
                wechatConfig.getSubscribeSceneDescription(),
                wechatConfig.getSubscribeOperator()
        );
    }

    public void saveSubscription(ReminderSubscribeRequest request) {
        if (!StringUtils.hasText(wechatConfig.getSubscribeTemplateId())) {
            throw new RuntimeException("订阅消息模板未配置");
        }

        Long userId = StpUtil.getLoginIdAsLong();
        LocalDate remindDate = parseDate(request.getDate());

        LambdaQueryWrapper<ReminderSubscription> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ReminderSubscription::getUserId, userId)
                .eq(ReminderSubscription::getSourceKey, request.getSourceKey());

        ReminderSubscription subscription = this.getOne(wrapper);
        if (subscription == null) {
            subscription = new ReminderSubscription();
            subscription.setUserId(userId);
            subscription.setSourceKey(request.getSourceKey());
        }

        subscription.setIdolId(request.getIdolId());
        subscription.setSourceType(request.getSourceType());
        subscription.setTitle(request.getTitle());
        subscription.setRemindMonth(remindDate.getMonthValue());
        subscription.setRemindDay(remindDate.getDayOfMonth());
        subscription.setTemplateId(wechatConfig.getSubscribeTemplateId());
        subscription.setStatus(1);
        // 使用中国时区的当前时间
        subscription.setLastSubscribedAt(LocalDateTime.now(java.time.ZoneId.of("Asia/Shanghai")));
        subscription.setLastSentYear(remindDate.getYear());

        if (subscription.getId() == null) {
            this.save(subscription);
        } else {
            this.lambdaUpdate()
                    .eq(ReminderSubscription::getId, subscription.getId())
                    .set(ReminderSubscription::getIdolId, subscription.getIdolId())
                    .set(ReminderSubscription::getSourceType, subscription.getSourceType())
                    .set(ReminderSubscription::getTitle, subscription.getTitle())
                    .set(ReminderSubscription::getRemindMonth, subscription.getRemindMonth())
                    .set(ReminderSubscription::getRemindDay, subscription.getRemindDay())
                    .set(ReminderSubscription::getTemplateId, subscription.getTemplateId())
                    .set(ReminderSubscription::getStatus, subscription.getStatus())
                    .set(ReminderSubscription::getLastSubscribedAt, subscription.getLastSubscribedAt())
                    .set(ReminderSubscription::getLastSentYear, subscription.getLastSentYear())
                    .update();
        }
    }

    public void disableSubscription(String sourceKey, String sourceType) {
        Long userId = StpUtil.getLoginIdAsLong();
        this.lambdaUpdate()
                .eq(ReminderSubscription::getUserId, userId)
                .eq(ReminderSubscription::getSourceKey, sourceKey)
                .eq(ReminderSubscription::getSourceType, sourceType)
                .set(ReminderSubscription::getStatus, 0)
                .update();
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void sendDueReminders() {
        if (!StringUtils.hasText(wechatConfig.getSubscribeTemplateId())) {
            return;
        }

        // 使用中国时区的当前日期
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Shanghai"));
        LambdaQueryWrapper<ReminderSubscription> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ReminderSubscription::getStatus, 1)
                .eq(ReminderSubscription::getRemindMonth, today.getMonthValue())
                .eq(ReminderSubscription::getRemindDay, today.getDayOfMonth())
                .and(w -> w.eq(ReminderSubscription::getLastSentYear, today.getYear())
                        .or()
                        .isNull(ReminderSubscription::getLastSentYear));

        List<ReminderSubscription> subscriptions = this.list(wrapper);
        for (ReminderSubscription subscription : subscriptions) {
            try {
                sendSubscribeMessage(subscription, today);
                this.lambdaUpdate()
                        .eq(ReminderSubscription::getId, subscription.getId())
                        .set(ReminderSubscription::getStatus, 0)
                        .update();
            } catch (Exception e) {
                log.error("发送订阅提醒失败, subscriptionId={}", subscription.getId(), e);
            }
        }
    }

    private void sendSubscribeMessage(ReminderSubscription subscription, LocalDate today) throws Exception {
        User user = userService.getById(subscription.getUserId());
        if (user == null || !StringUtils.hasText(user.getOpenid())) {
            throw new RuntimeException("用户 openid 不存在");
        }

        String accessToken = getAccessToken();
        String url = "https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=" + accessToken;

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("touser", user.getOpenid());
        payload.put("template_id", subscription.getTemplateId());
        if (StringUtils.hasText(wechatConfig.getSubscribePage())) {
            payload.put("page", wechatConfig.getSubscribePage());
        }
        payload.put("data", buildMessageData(subscription, today));

        String response = restTemplate.postForObject(url, payload, String.class);
        JsonNode responseNode = objectMapper.readTree(response);
        int errcode = responseNode.path("errcode").asInt(-1);
        if (errcode != 0) {
            throw new RuntimeException("微信发送失败: " + responseNode.path("errmsg").asText("unknown"));
        }
    }

    private Map<String, Object> buildMessageData(ReminderSubscription subscription, LocalDate today) {
        Map<String, Object> data = new LinkedHashMap<>();
        String title = limitText(subscription.getTitle(), 20);
        String remindTime = buildRemindTime(subscription, today);
        String remark = buildRemark(subscription, today);
        data.put(resolveKey(wechatConfig.getSubscribeTitleKey(), "thing5"), createValueNode(title));
        data.put(resolveKey(wechatConfig.getSubscribeDateKey(), "date4"), createValueNode(remindTime));
        data.put(resolveKey(wechatConfig.getSubscribeRemarkKey(), "thing11"), createValueNode(remark));
        return data;
    }

    private String buildRemindTime(ReminderSubscription subscription, LocalDate today) {
        int remindYear = subscription.getLastSentYear() != null ? subscription.getLastSentYear() : today.getYear();
        LocalDate remindDate = LocalDate.of(remindYear, subscription.getRemindMonth(), subscription.getRemindDay());
        return remindDate.format(REMINDER_TIME_FORMATTER);
    }

    private String buildRemark(ReminderSubscription subscription, LocalDate today) {
        String remindTime = buildRemindTime(subscription, today);
        return limitText("一次性提醒：你订阅的" + subscription.getTitle() + "将在" + remindTime + "到来，请提前安排。", 20);
    }

    private Map<String, String> createValueNode(String value) {
        Map<String, String> node = new LinkedHashMap<>();
        node.put("value", value);
        return node;
    }

    private String getAccessToken() throws Exception {
        long now = System.currentTimeMillis();
        if (StringUtils.hasText(cachedAccessToken) && now < accessTokenExpireAt) {
            return cachedAccessToken;
        }

        String url = String.format(
                "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
                wechatConfig.getAppId(),
                wechatConfig.getAppSecret()
        );
        String response = restTemplate.getForObject(url, String.class);
        JsonNode responseNode = objectMapper.readTree(response);
        if (!responseNode.hasNonNull("access_token")) {
            throw new RuntimeException("获取 access_token 失败: " + responseNode.path("errmsg").asText("unknown"));
        }

        cachedAccessToken = responseNode.path("access_token").asText();
        int expiresIn = responseNode.path("expires_in").asInt(7200);
        accessTokenExpireAt = now + Math.max(300, expiresIn - 300) * 1000L;
        return cachedAccessToken;
    }

    private LocalDate parseDate(String dateText) {
        try {
            return LocalDate.parse(dateText);
        } catch (Exception e) {
            throw new RuntimeException("提醒日期格式不正确");
        }
    }

    private String resolveKey(String configuredKey, String fallbackKey) {
        return StringUtils.hasText(configuredKey) ? configuredKey : fallbackKey;
    }

    public boolean checkSubscriptionStatus(String sourceKey, String sourceType) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<ReminderSubscription> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ReminderSubscription::getUserId, userId)
               .eq(ReminderSubscription::getSourceKey, sourceKey)
               .eq(ReminderSubscription::getSourceType, sourceType)
               .eq(ReminderSubscription::getStatus, 1);
        return this.count(wrapper) > 0;
    }

    private String limitText(String text, int maxLength) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength);
    }
}
