package com.kafka.mastery.order.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEntity {
    @Id
    private String orderId;
    private String userId;
    private Double amount;
    private String status;
    private Instant createdAt;
}
