package com.kafka.mastery.analytics.processor;

import com.kafka.mastery.event.OrderCreatedEvent;
import io.confluent.kafka.streams.serdes.avro.SpecificAvroSerde;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Collections;
import java.util.Map;

@Component
@Slf4j
public class AnalyticsStreamProcessor {

    private static final String ORDER_TOPIC = "order-created";
    private static final String SCHEMA_REGISTRY_URL = "http://localhost:8081";

    @Bean
    public KStream<String, OrderCreatedEvent> kStream(StreamsBuilder streamsBuilder) {
        SpecificAvroSerde<OrderCreatedEvent> orderSerde = new SpecificAvroSerde<>();
        orderSerde.configure(Collections.singletonMap("schema.registry.url", SCHEMA_REGISTRY_URL), false);

        KStream<String, OrderCreatedEvent> stream = streamsBuilder.stream(ORDER_TOPIC, Consumed.with(Serdes.String(), orderSerde));

        // 1. Real-time Sales Aggregation (Stateful)
        stream.mapValues(OrderCreatedEvent::getAmount)
                .groupByKey(Grouped.with(Serdes.String(), Serdes.Double()))
                .reduce(Double::sum, Materialized.as("total-sales-store"))
                .toStream()
                .peek((key, value) -> log.info("Update: Total sales for user {} is now ${}", key, value));

        // 2. Windowed Aggregation (Orders per Minute)
        TimeWindows window = TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(1));
        stream.groupBy((key, value) -> "ALL_ORDERS") // Group all for global count
                .windowedBy(window)
                .count(Materialized.as("order-count-window"))
                .toStream()
                .peek((key, value) -> log.info("Update: Orders in current window [{} - {}]: {}", key.window().start(), key.window().end(), value));

        // 3. Simple Fraud Detection (Stateless)
        stream.filter((key, value) -> value.getAmount() > 1000)
                .peek((key, value) -> log.warn("FRAUD ALERT: High value order detected! OrderId: {}, Amount: {}", value.getOrderId(), value.getAmount()));

        return stream;
    }
}
