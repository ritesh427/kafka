package com.kafka.mastery.notification.listener;

import com.kafka.mastery.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.listener.ConsumerSeekAware;
import org.apache.kafka.common.TopicPartition;
import java.util.Map;

import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.retrytopic.TopicSuffixingStrategy;
import org.springframework.retry.annotation.Backoff;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.time.Duration;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderEventListener implements ConsumerSeekAware {

    private final StringRedisTemplate redisTemplate;
    private static final String IDEMPOTENCY_KEY_PREFIX = "order-processed:";

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            topicSuffixingStrategy = TopicSuffixingStrategy.SUFFIX_WITH_INDEX_VALUE,
            dltStrategy = org.springframework.kafka.retrytopic.DltStrategy.FAIL_ON_ERROR,
            include = {TransientFailureException.class}
    )
    @KafkaListener(
            topics = "order-created", 
            groupId = "notification-group",
            concurrency = "3" // Spawns 3 consumer threads for this listener
    )
    public void handleOrderCreated(OrderCreatedEvent event, Acknowledgment ack) {
        log.info("Received OrderCreatedEvent: correlationId={}", event.getCorrelationId());
        
        String idempotencyKey = IDEMPOTENCY_KEY_PREFIX + event.getCorrelationId();
        
        // 1. Idempotency Check
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(idempotencyKey, "PROCESSED", Duration.ofHours(24));
        if (Boolean.FALSE.equals(isNew)) {
            log.warn("Duplicate message detected for correlationId: {}. Skipping...", event.getCorrelationId());
            ack.acknowledge();
            return;
        }

        try {
            // 2. Simulate Failures for Learning
            simulateFailures(event);

            log.info("Successfully processed notification for order: {}", event.getOrderId());
            ack.acknowledge();
        } catch (TransientFailureException e) {
            log.error("Transient failure for order {}. Retrying...", event.getOrderId());
            // Remove from Redis so retry can attempt again (or leave if logic is inside try)
            redisTemplate.delete(idempotencyKey);
            throw e; // Trigger @RetryableTopic
        } catch (Exception e) {
            log.error("Permanent failure for order {}. Moving to DLQ.", event.getOrderId());
            throw e; // Moves to DLT
        }
    }

    @DltHandler
    public void handleDlt(OrderCreatedEvent event, @org.springframework.messaging.handler.annotation.Header(org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.error("Poison Pill Alert! Event {} landed in DLT of topic {}", event.getOrderId(), topic);
        // Manual intervention or alerting logic here
    }

    private void simulateFailures(OrderCreatedEvent event) {
        if (event.getUserId().toString().equals("fail_transient")) {
            throw new TransientFailureException("Simulated network glitch");
        }
        if (event.getUserId().toString().equals("fail_permanent")) {
            throw new RuntimeException("Simulated poison pill / code bug");
        }
    }

    public static class TransientFailureException extends RuntimeException {
        public TransientFailureException(String message) { super(message); }
    }

    @Override
    public void onPartitionsAssigned(Map<TopicPartition, Long> assignments, ConsumerSeekCallback callback) {
        log.info("Partitions assigned.");
    }
}
