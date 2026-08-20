package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.security.JwtService;
import com.example.demo.service.OtpService;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final OtpService otpService;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/otp/request")
    public void requestOtp(@RequestBody Map<String, String> body) {
        otpService.generateAndSend(body.get("email"));
    }

    @PostMapping("/otp/verify")
    public Map<String, String> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        boolean ok = otpService.verify(email, body.get("code"));
        if (!ok) throw new IllegalArgumentException("Invalid or expired code");

        User user = userService.findOrCreateByEmail(email);
        String token = jwtService.generateToken(user.getId(), email, user.getName(), user.getPicture());
        return Map.of("token", token);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        User user = userService.getByEmail(email);

        if (user.getPassword() == null) {
            throw new IllegalArgumentException("This account has no password set. Sign in with OTP instead.");
        }
        if (!userService.checkPassword(user, body.get("password"))) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), email, user.getName(), user.getPicture());
        return Map.of("token", token);
    }
}