package com.kafka.mastery.shipping.repository;

import com.kafka.mastery.shipping.entity.ShipmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShippingRepository extends JpaRepository<ShipmentEntity, String> {
}
