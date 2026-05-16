# Phase 1: Basic Microservices & Kafka Integration

## 🎯 Phase Goals
- Establish a multi-module Maven project structure.
- Define shared Avro schemas in a `common-library`.
- Implement `order-service` as a Kafka Producer.
- Implement `notification-service` as a Kafka Consumer.
- Demonstrate a basic end-to-end event flow.

## 🏗️ Architecture Decisions
- **Multi-module Maven:** Used to manage dependencies centrally and share Avro generated classes between services.
- **Avro & Schema Registry:** Chosen for production-grade serialization. Avro provides a compact binary format and Schema Registry ensures that producers and consumers agree on the data structure.
- **Idempotent Producer:** Enabled in `order-service` (`enable.idempotence: true`) to ensure exactly-once delivery to a single partition even if retries occur.

## 🛠️ Implementation Details
- **Common Library:** Contains `order-created.avsc`. The `avro-maven-plugin` is configured to generate Java classes from this schema.
- **Order Service:**
  - `OrderProducerService`: Uses `KafkaTemplate` to send `OrderCreatedEvent`.
  - `OrderController`: REST endpoint `POST /api/orders` to trigger the event.
- **Notification Service:**
  - `OrderEventListener`: Uses `@KafkaListener` to consume `order-created` topic events.

## 🎓 Concepts Learned
### 1. Avro vs JSON
- JSON is human-readable but bulky.
- Avro is binary, schema-based, and much faster for high-throughput Kafka systems.

### 2. The Role of Schema Registry
- It acts as a metadata repository for schemas.
- Producers register schemas; Consumers fetch them by ID (found in the message header).
- This prevents "poison pills" where a producer sends data the consumer can't parse.

### 3. Idempotency in Producers
- By setting `enable.idempotence=true`, Kafka assigns a Producer ID (PID) and sequence numbers to messages.
- If a message is sent but the ACK is lost, the producer retries. The broker sees the same PID and sequence number and discards the duplicate.

## 🚀 How to Run
1. Ensure the infrastructure from Phase 0 is running (`docker-compose up -d`).
2. Build the project: `mvn clean install` (Requires Java 17 and Maven).
3. Run `OrderServiceApplication` (Port 8082).
4. Run `NotificationServiceApplication` (Port 8083).
5. Trigger an event:
   ```bash
   curl -X POST "http://localhost:8082/api/orders?userId=user123&amount=99.99"
   ```
6. Observe logs in both services.

## ❓ Interview Questions
- **What is the Outbox pattern and why do we need it?** (Coming in Phase 6, but good to keep in mind).
- **How does Kafka ensure message ordering?** (Ordering is guaranteed per partition).
- **What happens if the Schema Registry is down?** (Producers/Consumers might fail if they don't have the schema cached).
