package com.idoldiary.controller;

import com.idoldiary.common.Result;
import com.idoldiary.dto.ReminderSubscribeConfigResponse;
import com.idoldiary.dto.ReminderSubscribeRequest;
import com.idoldiary.dto.ReminderUnsubscribeRequest;
import com.idoldiary.service.ReminderSubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reminder-subscriptions")
@RequiredArgsConstructor
public class ReminderSubscriptionController {

    private final ReminderSubscriptionService reminderSubscriptionService;

    @GetMapping("/config")
    public Result<ReminderSubscribeConfigResponse> getSubscribeConfig() {
        return Result.success(reminderSubscriptionService.getSubscribeConfig());
    }

    @GetMapping("/status")
    public Result<Boolean> checkSubscriptionStatus(@RequestParam String sourceKey, @RequestParam String sourceType) {
        boolean isSubscribed = reminderSubscriptionService.checkSubscriptionStatus(sourceKey, sourceType);
        return Result.success(isSubscribed);
    }

    @PostMapping("/subscribe")
    public Result<Void> subscribeReminder(@Valid @RequestBody ReminderSubscribeRequest request) {
        reminderSubscriptionService.saveSubscription(request);
        return Result.success();
    }

    @PostMapping("/unsubscribe")
    public Result<Void> unsubscribeReminder(@Valid @RequestBody ReminderUnsubscribeRequest request) {
        reminderSubscriptionService.disableSubscription(request.getSourceKey(), request.getSourceType());
        return Result.success();
    }
}
