package com.kafka.mastery.product.controller;

import com.kafka.mastery.product.entity.ProductEntity;
import com.kafka.mastery.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ProductEntity createProduct(@RequestParam String name, @RequestParam Double price) {
        return productService.createProduct(name, price);
    }

    @GetMapping
    public List<ProductEntity> getAllProducts() {
        return productService.getAllProducts();
    }
}
