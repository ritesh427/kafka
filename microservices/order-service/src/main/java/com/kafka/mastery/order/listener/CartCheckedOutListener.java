package com.kafka.mastery.order.listener;

import com.kafka.mastery.event.CartCheckedOutEvent;
import com.kafka.mastery.order.service.OrderProducerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CartCheckedOutListener {

    private final OrderProducerService orderProducerService;

    @KafkaListener(topics = "cart-checked-out", groupId = "order-group")
    public void handleCartCheckedOut(CartCheckedOutEvent event) {
        log.info("Received CartCheckedOutEvent for user: {}. Amount: {}", event.getUserId(), event.getAmount());
        
        // Trigger the order creation logic (Outbox)
        orderProducerService.createOrderWithOutbox(
                event.getUserId().toString(), 
                event.getAmount()
        );
        
        log.info("Successfully converted Cart checkout to Order for user: {}", event.getUserId());
    }
}
