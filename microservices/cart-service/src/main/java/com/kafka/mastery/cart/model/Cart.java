package com.kafka.mastery.cart.model;

import lombok.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart implements Serializable {
    private String cartId;
    private String userId;
    private List<String> items = new ArrayList<>();
    private Double totalAmount = 0.0;
}
