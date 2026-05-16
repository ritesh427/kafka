package com.kafka.mastery.product.service;

import com.kafka.mastery.product.entity.ProductEntity;
import com.kafka.mastery.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public ProductEntity createProduct(String name, Double price) {
        ProductEntity product = ProductEntity.builder()
                .productId(UUID.randomUUID().toString())
                .name(name)
                .price(price)
                .build();
        return productRepository.save(product);
    }

    public List<ProductEntity> getAllProducts() {
        return productRepository.findAll();
    }
}
