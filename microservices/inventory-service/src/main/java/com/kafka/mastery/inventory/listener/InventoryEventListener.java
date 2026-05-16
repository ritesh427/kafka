package com.kafka.mastery.inventory.listener;

import com.kafka.mastery.event.OrderCreatedEvent;
import com.kafka.mastery.event.InventoryReservedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class InventoryEventListener {

    private final KafkaTemplate<String, InventoryReservedEvent> kafkaTemplate;
    private static final String INVENTORY_TOPIC = "inventory-reserved";

    @KafkaListener(topics = "order-created", groupId = "inventory-group")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Reserving inventory for order: {}", event.getOrderId());

        boolean success = !event.getUserId().toString().equals("fail_inventory");

        InventoryReservedEvent result = InventoryReservedEvent.newBuilder()
                .setOrderId(event.getOrderId().toString())
                .setStatus(success ? "SUCCESS" : "FAILED")
                .setReason(success ? null : "Out of stock (simulated)")
                .build();

        log.info("Inventory result for order {}: {}", event.getOrderId(), result.getStatus());
        kafkaTemplate.send(INVENTORY_TOPIC, result.getOrderId().toString(), result);
    }
}
