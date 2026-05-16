# Phase 3: Resilient Consumers (Retry, DLQ & Idempotency)

## 🎯 Phase Goals
- Implement **Non-blocking Retries** to handle transient failures.
- Implement **Dead Letter Queues (DLQ)** for unrecoverable errors ("Poison Pills").
- Implement **Application-level Idempotency** using Redis.
- Distinguish between **Transient** and **Permanent** failures.

## 🏗️ Architecture Decisions

### 1. Non-blocking Retries (`@RetryableTopic`)
- **Blocking Retry**: If a message fails, the consumer stays on that message, blocking all other messages in the partition. This causes **Consumer Lag** to spike and stalls the pipeline.
- **Non-blocking Retry**: The failed message is sent to a "retry topic" (e.g., `order-created-retry-0`). The consumer then moves to the next message in the main topic. A separate listener processes the retry topic after a delay.
- **Trade-off**: Non-blocking retries break strict message ordering within a partition.

### 2. Dead Letter Queue (DLQ)
- Messages that exhaust all retry attempts are sent to a `DLT` (Dead Letter Topic).
- This prevents a single bad message from crashing your consumers repeatedly.

### 3. Redis-backed Idempotency
- Kafka ensures **At-Least-Once** delivery. If a consumer processes a message, crashes, and then restarts before committing the offset, it will receive the message again.
- By storing a `correlationId` in Redis with a TTL (e.g., 24h), we can check if a message was already processed before executing expensive business logic.

## 🛠️ Implementation Details
- **`OrderCreatedEvent`**: Updated with a `correlationId`.
- **`OrderEventListener`**:
    - Uses `@RetryableTopic` with exponential backoff.
    - Uses `StringRedisTemplate` to implement a "Set-If-Absent" lock for idempotency.
    - Contains simulation logic for transient (`fail_transient`) and permanent (`fail_permanent`) failures.

## 🎓 Concepts Learned

### 1. The "Retry Storm" Problem
- If 1000 messages fail and all retry at the same time, it can overwhelm downstream databases. Non-blocking retries with exponential backoff mitigate this.

### 2. Poison Pills
- A message with invalid data or one that triggers a bug in your code. Without a DLQ, this message would block your entire partition forever (or until manually deleted).

### 3. Correlation IDs vs Order IDs
- `orderId` represents the business entity.
- `correlationId` represents a specific attempt or event instance. Using `correlationId` for idempotency is safer if the same `orderId` can be updated multiple times.

## 🚀 How to Run
1. Ensure Redis is running (`docker-compose up -d`).
2. Run `OrderServiceApplication` and `NotificationServiceApplication`.
3. **Normal Flow**: `curl -X POST "http://localhost:8082/api/orders/async?userId=user1&amount=10"`
4. **Test Idempotency**: Send the same request twice (manually using same correlationId would require code change, but simulated by Kafka retries).
5. **Test Transient Retry**: `curl -X POST "http://localhost:8082/api/orders/async?userId=fail_transient&amount=10"`
    - Observe logs: You'll see "Retrying..." and the message landing in a retry topic.
6. **Test Poison Pill (DLQ)**: `curl -X POST "http://localhost:8082/api/orders/async?userId=fail_permanent&amount=10"`
    - Observe logs: Message lands in DLT immediately.

## ❓ Interview Questions
- **Why is non-blocking retry better than simple retries in a consumer?**
- **How do you handle idempotency if Redis is down?** (Fallback to DB unique constraints).
- **Explain the difference between `@RetryableTopic` and `@Retryable`.** (`@RetryableTopic` uses separate Kafka topics; `@Retryable` is in-memory).
