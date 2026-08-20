package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public Map<String, Object> me() {
        Claims claims = currentClaims();
        User user = userService.getById(UUID.fromString(claims.get("userId", String.class)));

        Map<String, Object> response = new HashMap<>();
        response.put("id", claims.get("userId", String.class));
        response.put("email", claims.getSubject());
        response.put("name", claims.get("name", String.class));
        response.put("picture", claims.get("picture", String.class));
        response.put("hasPassword", user.getPassword() != null);

        return response;
    }

    @DeleteMapping("/me")
    public void deleteOwnAccount() {
        String email = currentClaims().getSubject();
        userService.deleteByEmail(email);
    }

    @PutMapping("/me/password")
    public void updatePassword(@RequestBody Map<String, String> body) {
        String email = currentClaims().getSubject();
        userService.setOrChangePassword(email, body.get("currentPassword"), body.get("newPassword"));
    }

    @GetMapping("/all")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers().stream().map(this::toResponse).toList();
    }

    @GetMapping("/search")
    public List<UserResponse> searchUsers(@RequestParam String query) {
        return userService.search(query).stream().map(this::toResponse).toList();
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable UUID id) {
        userService.deleteById(id);
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getName(), u.getPicture());
    }

    private Claims currentClaims() {
        return (Claims) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public record UserResponse(UUID id, String email, String name, String picture) {
    }
}