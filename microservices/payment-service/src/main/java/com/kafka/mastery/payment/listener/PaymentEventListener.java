package com.kafka.mastery.payment.listener;

import com.kafka.mastery.event.OrderCreatedEvent;
import com.kafka.mastery.event.PaymentProcessedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentEventListener {

    private final KafkaTemplate<String, PaymentProcessedEvent> kafkaTemplate;
    private static final String PAYMENT_TOPIC = "payment-processed";

    @KafkaListener(topics = "order-created", groupId = "payment-group")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Processing payment for order: {}", event.getOrderId());

        boolean success = !event.getUserId().toString().equals("fail_payment");
        
        PaymentProcessedEvent result = PaymentProcessedEvent.newBuilder()
                .setOrderId(event.getOrderId().toString())
                .setPaymentId(UUID.randomUUID().toString())
                .setStatus(success ? "SUCCESS" : "FAILED")
                .setReason(success ? null : "Insufficient funds (simulated)")
                .build();

        log.info("Payment result for order {}: {}", event.getOrderId(), result.getStatus());
        kafkaTemplate.send(PAYMENT_TOPIC, result.getOrderId().toString(), result);
    }
}
