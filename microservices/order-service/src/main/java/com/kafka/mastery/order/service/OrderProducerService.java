package com.kafka.mastery.order.service;

import com.kafka.mastery.event.OrderCreatedEvent;
import com.kafka.mastery.order.entity.OrderEntity;
import com.kafka.mastery.order.entity.OutboxEvent;
import com.kafka.mastery.order.repository.OrderRepository;
import com.kafka.mastery.order.repository.OutboxRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderProducerService {

    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;
    private final OrderRepository orderRepository;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;
    private static final String TOPIC = "order-created";

    @Transactional
    public void createOrderWithOutbox(String userId, double amount) {
        String orderId = UUID.randomUUID().toString();
        
        // 1. Save Business Entity
        OrderEntity order = OrderEntity.builder()
                .orderId(orderId)
                .userId(userId)
                .amount(amount)
                .status("CREATED")
                .createdAt(Instant.now())
                .build();
        orderRepository.save(order);

        // 2. Save Outbox Event
        try {
            OrderCreatedEvent event = createEvent(userId, amount, orderId);
            OutboxEvent outbox = OutboxEvent.builder()
                    .aggregateType("Order")
                    .aggregateId(orderId)
                    .type("OrderCreated")
                    .payload(objectMapper.writeValueAsString(event))
                    .createdAt(Instant.now())
                    .build();
            outboxRepository.save(outbox);
            log.info("Order and Outbox event saved for OrderId: {}", orderId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save outbox event", e);
        }
    }

    public void createOrderAsync(String userId, double amount) {
        OrderCreatedEvent event = createEvent(userId, amount, UUID.randomUUID().toString());
        log.info("Producing OrderCreatedEvent (Async): {}", event);
        
        kafkaTemplate.send(TOPIC, event.getOrderId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("SUCCESS (Async): Offset=[{}]", result.getRecordMetadata().offset());
                    } else {
                        log.error("FAILURE (Async): {}", ex.getMessage());
                    }
                });
    }

    public void createOrderSync(String userId, double amount) {
        OrderCreatedEvent event = createEvent(userId, amount, UUID.randomUUID().toString());
        log.info("Producing OrderCreatedEvent (Sync): {}", event);
        try {
            var result = kafkaTemplate.send(TOPIC, event.getOrderId().toString(), event).get();
            log.info("SUCCESS (Sync): Offset=[{}]", result.getRecordMetadata().offset());
        } catch (Exception e) {
            log.error("FAILURE (Sync): {}", e.getMessage());
            throw new RuntimeException("Failed to send event sync", e);
        }
    }

    private OrderCreatedEvent createEvent(String userId, double amount, String orderId) {
        return OrderCreatedEvent.newBuilder()
                .setOrderId(orderId)
                .setCorrelationId(UUID.randomUUID().toString())
                .setUserId(userId)
                .setAmount(amount)
                .setCurrency("USD")
                .setStatus("CREATED")
                .setCreatedAt(Instant.now().toEpochMilli())
                .build();
    }
}
