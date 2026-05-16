# Phase 2: Producer & Consumer Deep Dive

## 🎯 Phase Goals
- Master the difference between **Sync** and **Async** production.
- Understand **Batching** and **Compression** for high throughput.
- Implement **Manual Acknowledgments** for precise delivery control.
- Explore **Offset Seeking** for event replay scenarios.
- Analyze **Consumer Groups** and **Rebalancing**.

## 🏗️ Architecture Decisions

### 1. Sync vs Async Production
- **Async (`order-service/async`)**: The producer adds the message to an internal buffer and returns immediately. A background thread handles the actual network I/O. Best for high-throughput, low-latency applications.
- **Sync (`order-service/sync`)**: The producer waits for the broker to acknowledge the write (based on `acks` setting) before proceeding. Crucial for systems where data loss is unacceptable and ordering is strictly serial.

### 2. Batching & Throughput (`application.yml`)
- **`batch.size`**: Maximum size (in bytes) of a single batch.
- **`linger.ms`**: How long the producer waits to fill a batch before sending. Increasing this improves throughput but adds latency.
- **`compression.type: snappy`**: Reduces network load and disk usage with minimal CPU overhead.

### 3. Manual Acks (`notification-service`)
- By disabling `enable-auto-commit`, the consumer must explicitly call `ack.acknowledge()`.
- This ensures that an offset is only marked as "processed" **after** the business logic (e.g., sending an email) completes successfully. If the service crashes before the ack, another consumer can pick up the message.

## 🛠️ Implementation Details
- **`OrderProducerService`**: Exposed two endpoints to compare performance and behavior of Sync vs Async.
- **`OrderEventListener`**: Implements `ConsumerSeekAware`. This allows the listener to manually manipulate offsets (e.g., seeking to the beginning) for auditing or error recovery.

## 🎓 Concepts Learned

### 1. Delivery Guarantees
- **At-Most-Once**: `acks=0`. Message sent, no retry.
- **At-Least-Once**: `acks=1` or `all`, manual acks. If no ack is received, message is resent. Potential for duplicates.
- **Exactly-Once**: `acks=all`, `enable.idempotence=true`, and (optionally) Kafka Transactions.

### 2. Consumer Rebalancing
- When a new consumer joins or an existing one leaves, Kafka triggers a **Rebalance**.
- Partitions are reassigned among members of the group.
- Using `ConsumerSeekAware` or `ConsumerRebalanceListener`, we can save/load offsets during these transitions.

### 3. Kafka's "Mechanical Sympathy" with Batches
- Kafka is efficient because it treats batches of messages as a single unit of work for Disk I/O and Network transfer, leveraging sequential writes and `sendfile()` zero-copy.

## 🚀 How to Run
1. Start infrastructure (`docker-compose up -d`).
2. Run `OrderServiceApplication` and `NotificationServiceApplication`.
3. **Async Test**: `curl -X POST "http://localhost:8082/api/orders/async?userId=userA&amount=10"`
4. **Sync Test**: `curl -X POST "http://localhost:8082/api/orders/sync?userId=userB&amount=20"`
5. **Replay**: Uncomment `callback.seekToBeginning` in `OrderEventListener` to see all historical orders re-processed on startup.

## ❓ Interview Questions
- **What is `linger.ms` and how does it relate to `batch.size`?**
- **Why would you choose Manual Acks over Auto Commit?** (Prevents data loss if processing fails).
- **Explain the difference between `acks=1` and `acks=all`.**
- **How do you handle a "Poison Pill" message in a manual ack setup?** (Topic for Phase 3: DLQs).
