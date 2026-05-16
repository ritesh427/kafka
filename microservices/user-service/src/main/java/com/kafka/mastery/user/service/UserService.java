package com.kafka.mastery.user.service;

import com.kafka.mastery.event.UserCreatedEvent;
import com.kafka.mastery.user.entity.UserEntity;
import com.kafka.mastery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final KafkaTemplate<String, UserCreatedEvent> kafkaTemplate;
    private static final String TOPIC = "user-created";

    @Transactional
    public UserEntity createUser(String email, String fullName) {
        String userId = UUID.randomUUID().toString();
        UserEntity user = UserEntity.builder()
                .userId(userId)
                .email(email)
                .fullName(fullName)
                .build();
        
        userRepository.save(user);

        UserCreatedEvent event = UserCreatedEvent.newBuilder()
                .setUserId(userId)
                .setEmail(email)
                .setFullName(fullName)
                .build();

        log.info("Emitting UserCreatedEvent for user: {}", userId);
        kafkaTemplate.send(TOPIC, userId, event);
        
        return user;
    }
}
