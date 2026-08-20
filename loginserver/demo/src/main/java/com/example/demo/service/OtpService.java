package com.example.demo.service;

import com.example.demo.entity.OtpToken;
import com.example.demo.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final JavaMailSender mailSender;
    private static final SecureRandom RANDOM = new SecureRandom();

    public void generateAndSend(String email) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));

        OtpToken token = new OtpToken();
        token.setEmail(email);
        token.setCode(code);
        token.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        otpTokenRepository.save(token);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your verification code");
        message.setText("Your OTP is: " + code + " (expires in 10 minutes)");
        mailSender.send(message);
    }

    public boolean verify(String email, String code) {
        OtpToken token = otpTokenRepository
                .findTopByEmailAndUsedFalseOrderByIdDesc(email)
                .orElse(null);

        if (token == null) return false;
        if (token.isUsed()) return false;
        if (token.getExpiresAt().isBefore(Instant.now())) return false;
        if (token.getAttempts() >= 5) return false;

        token.setAttempts(token.getAttempts() + 1);

        if (!token.getCode().equals(code)) {
            otpTokenRepository.save(token);
            return false;
        }

        token.setUsed(true);
        otpTokenRepository.save(token);
        return true;
    }
}