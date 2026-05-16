package com.kafka.mastery.shipping.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentEntity {
    @Id
    private String shipmentId;
    private String orderId;
    private String trackingNumber;
    private String status;
    private Instant shippedAt;
}
