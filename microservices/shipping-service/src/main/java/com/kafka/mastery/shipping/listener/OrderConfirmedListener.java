package com.kafka.mastery.shipping.listener;

import com.kafka.mastery.event.OrderConfirmedEvent;
import com.kafka.mastery.event.OrderShippedEvent;
import com.kafka.mastery.shipping.entity.ShipmentEntity;
import com.kafka.mastery.shipping.repository.ShippingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderConfirmedListener {

    private final ShippingRepository shippingRepository;
    private final KafkaTemplate<String, OrderShippedEvent> kafkaTemplate;
    private static final String SHIPPED_TOPIC = "order-shipped";

    @KafkaListener(topics = "order-confirmed", groupId = "shipping-group")
    @Transactional
    public void handleOrderConfirmed(OrderConfirmedEvent event) {
        log.info("Received OrderConfirmedEvent. Initiating shipping for order: {}", event.getOrderId());

        String shipmentId = UUID.randomUUID().toString();
        String trackingNumber = "TRK" + System.currentTimeMillis();

        ShipmentEntity shipment = ShipmentEntity.builder()
                .shipmentId(shipmentId)
                .orderId(event.getOrderId().toString())
                .trackingNumber(trackingNumber)
                .status("SHIPPED")
                .shippedAt(Instant.now())
                .build();

        shippingRepository.save(shipment);

        OrderShippedEvent shippedEvent = OrderShippedEvent.newBuilder()
                .setOrderId(event.getOrderId().toString())
                .setTrackingNumber(trackingNumber)
                .setStatus("SHIPPED")
                .build();

        log.info("Order {} SHIPPED with tracking: {}", event.getOrderId(), trackingNumber);
        kafkaTemplate.send(SHIPPED_TOPIC, event.getOrderId().toString(), shippedEvent);
    }
}
