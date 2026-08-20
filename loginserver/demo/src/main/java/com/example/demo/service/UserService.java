package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User findOrCreateFromOAuth(String email, String name, String picture) {
        User user = userRepository.findByEmail(email).orElseGet(User::new);
        boolean isNewUser = user.getId() == null;

        user.setEmail(email);
        user.setName(name);
        user.setPicture(picture);
        user.setLastLoginAt(Instant.now());
        if (isNewUser) {
            user.setFirstLoginAt(Instant.now());
        }

        return userRepository.save(user);
    }

    public User findOrCreateByEmail(String email) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setFirstLoginAt(Instant.now());
            return userRepository.save(u);
        });
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> search(String query) {
        return userRepository.search(query);
    }

    public void deleteById(UUID id) {
        userRepository.deleteById(id);
    }

    public void deleteByEmail(String email) {
        userRepository.findByEmail(email).ifPresent(userRepository::delete);
    }

    public boolean checkPassword(User user, String rawPassword) {
        return user.getPassword() != null && passwordEncoder.matches(rawPassword, user.getPassword());
    }

    public void setOrChangePassword(String email, String currentPassword, String newPassword) {
        User user = getByEmail(email);

        if (user.getPassword() != null) {
            if (currentPassword == null || !checkPassword(user, currentPassword)) {
                throw new IllegalArgumentException("Current password is incorrect");
            }
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}