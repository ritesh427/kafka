package com.kafka.mastery.order.controller;

import com.kafka.mastery.order.service.OrderProducerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderProducerService orderProducerService;

    @PostMapping("/async")
    public String placeOrderAsync(@RequestParam String userId, @RequestParam double amount) {
        orderProducerService.createOrderAsync(userId, amount);
        return "Order request (Async) submitted!";
    }

    @PostMapping("/sync")
    public String placeOrderSync(@RequestParam String userId, @RequestParam double amount) {
        orderProducerService.createOrderSync(userId, amount);
        return "Order request (Sync) completed!";
    }

    @PostMapping("/outbox")
    public String placeOrderOutbox(@RequestParam String userId, @RequestParam double amount) {
        orderProducerService.createOrderWithOutbox(userId, amount);
        return "Order saved in DB and Outbox (CDC will handle emission)!";
    }
}
