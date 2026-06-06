package com.idoldiary.controller;

import com.idoldiary.common.Result;
import com.idoldiary.dto.LoginRequest;
import com.idoldiary.dto.LoginResponse;
import com.idoldiary.entity.User;
import com.idoldiary.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return Result.success(response);
    }

    @GetMapping("/user/info")
    public Result<User> getUserInfo() {
        User user = userService.getCurrentUser();
        return Result.success(user);
    }

    @PutMapping("/user/info")
    public Result<User> updateUserInfo(@RequestBody User user) {
        User updatedUser = userService.updateUser(user);
        return Result.success(updatedUser);
    }
}
