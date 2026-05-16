package com.kafka.mastery.order.listener;

import com.kafka.mastery.event.PaymentProcessedEvent;
import com.kafka.mastery.event.InventoryReservedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

import com.kafka.mastery.event.OrderConfirmedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import lombok.RequiredArgsConstructor;

@Service
@Slf4j
@RequiredArgsConstructor
public class SagaOutcomeListener {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String CONFIRMED_TOPIC = "order-confirmed";

    // In a real system, this state would be in a database.
    private final ConcurrentHashMap<String, SagaState> sagaRegistry = new ConcurrentHashMap<>();

    @KafkaListener(topics = "payment-processed", groupId = "order-saga-group")
    public void handlePayment(PaymentProcessedEvent event) {
        String orderId = event.getOrderId().toString();
        log.info("Saga step: Payment outcome for order {} is {}", orderId, event.getStatus());
        
        SagaState state = sagaRegistry.computeIfAbsent(orderId, k -> new SagaState());
        state.paymentStatus = event.getStatus().toString();
        checkSagaCompletion(orderId, state);
    }

    @KafkaListener(topics = "inventory-reserved", groupId = "order-saga-group")
    public void handleInventory(InventoryReservedEvent event) {
        String orderId = event.getOrderId().toString();
        log.info("Saga step: Inventory outcome for order {} is {}", orderId, event.getStatus());

        SagaState state = sagaRegistry.computeIfAbsent(orderId, k -> new SagaState());
        state.inventoryStatus = event.getStatus().toString();
        checkSagaCompletion(orderId, state);
    }

    private void checkSagaCompletion(String orderId, SagaState state) {
        if (state.paymentStatus != null && state.inventoryStatus != null) {
            if (state.paymentStatus.equals("SUCCESS") && state.inventoryStatus.equals("SUCCESS")) {
                log.info("SAGA COMPLETED: Order {} is now CONFIRMED.", orderId);
                
                OrderConfirmedEvent confirmedEvent = OrderConfirmedEvent.newBuilder()
                        .setOrderId(orderId)
                        .setUserId("unknown") // In real app, fetch from saga state or order DB
                        .setAmount(0.0)
                        .build();
                
                kafkaTemplate.send(CONFIRMED_TOPIC, orderId, confirmedEvent);
                
            } else {
                log.error("SAGA FAILED: Order {} must be REJECTED / ROLLED BACK. Payment: {}, Inventory: {}", 
                        orderId, state.paymentStatus, state.inventoryStatus);
            }
            sagaRegistry.remove(orderId);
        }
    }

    private static class SagaState {
        String paymentStatus;
        String inventoryStatus;
    }
}
