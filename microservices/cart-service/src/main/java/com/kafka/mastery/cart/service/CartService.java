package com.kafka.mastery.cart.service;

import com.kafka.mastery.cart.model.Cart;
import com.kafka.mastery.event.CartCheckedOutEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final KafkaTemplate<String, CartCheckedOutEvent> kafkaTemplate;
    private static final String CART_PREFIX = "cart:";
    private static final String TOPIC = "cart-checked-out";

    public Cart getCart(String userId) {
        Cart cart = (Cart) redisTemplate.opsForValue().get(CART_PREFIX + userId);
        if (cart == null) {
            cart = Cart.builder()
                    .cartId(UUID.randomUUID().toString())
                    .userId(userId)
                    .items(new ArrayList<>())
                    .totalAmount(0.0)
                    .build();
        }
        return cart;
    }

    public void addItem(String userId, String item, Double price) {
        Cart cart = getCart(userId);
        cart.getItems().add(item);
        cart.setTotalAmount(cart.getTotalAmount() + price);
        redisTemplate.opsForValue().set(CART_PREFIX + userId, cart);
    }

    public void checkout(String userId) {
        Cart cart = getCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        CartCheckedOutEvent event = CartCheckedOutEvent.newBuilder()
                .setCartId(cart.getCartId())
                .setUserId(userId)
                .setAmount(cart.getTotalAmount())
                .setItems(cart.getItems())
                .build();

        log.info("Emitting CartCheckedOutEvent for user: {}", userId);
        kafkaTemplate.send(TOPIC, userId, event);

        // Clear cart after checkout
        redisTemplate.delete(CART_PREFIX + userId);
    }
}
