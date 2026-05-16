package com.kafka.mastery.user.controller;

import com.kafka.mastery.user.entity.UserEntity;
import com.kafka.mastery.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public UserEntity createUser(@RequestParam String email, @RequestParam String fullName) {
        return userService.createUser(email, fullName);
    }
}
