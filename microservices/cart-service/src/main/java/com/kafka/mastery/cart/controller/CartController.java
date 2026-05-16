package com.kafka.mastery.cart.controller;

import com.kafka.mastery.cart.model.Cart;
import com.kafka.mastery.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public Cart getCart(@PathVariable String userId) {
        return cartService.getCart(userId);
    }

    @PostMapping("/{userId}/items")
    public void addItem(@PathVariable String userId, @RequestParam String item, @RequestParam Double price) {
        cartService.addItem(userId, item, price);
    }

    @PostMapping("/{userId}/checkout")
    public String checkout(@PathVariable String userId) {
        cartService.checkout(userId);
        return "Checkout successful!";
    }
}
