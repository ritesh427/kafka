# Phase 6: Transactional Outbox & CDC with Debezium

## 🎯 Phase Goals
- Solve the **Dual-Write Problem**.
- Implement the **Transactional Outbox Pattern**.
- Configure **Debezium** for Change Data Capture (CDC).
- Ensure **At-Least-Once** delivery with consistency between DB and Kafka.

## 🏗️ Architecture Decisions

### 1. The Dual-Write Problem
- **Scenario**: You update your database and then send a Kafka event.
- **Problem**: If the DB update succeeds but the Kafka send fails (network glitch, broker down), your system is inconsistent. Other services won't know about the DB change.
- **Anti-Pattern**: Using `@Transactional` over a method that calls `kafkaTemplate.send()`. This doesn't work because Kafka is not part of the DB transaction.

### 2. Transactional Outbox Pattern
- Instead of sending to Kafka directly, we save the event into a special `outbox_events` table in the **same database transaction** as the business logic.
- If the transaction commits, both the order and the event are saved. If it fails, neither is saved.
- A separate process (Debezium) reads these "outbox" entries and pushes them to Kafka.

### 3. Change Data Capture (CDC) with Debezium
- Debezium acts as a Kafka Connect source connector.
- It tails the PostgreSQL **Write-Ahead Log (WAL)**.
- When it sees a new entry in `outbox_events`, it publishes it to Kafka and then (optionally) deletes the entry or marks it as processed.

## 🛠️ Implementation Details
- **`OrderEntity` & `OutboxEvent`**: JPA entities in `order-service`.
- **`OrderProducerService.createOrderWithOutbox`**: Uses `@Transactional` to ensure atomicity.
- **`debezium-outbox-connector.json`**: Configuration for Kafka Connect. It uses the `EventRouter` transform to automatically route events from the outbox table to the correct Kafka topic based on the `aggregate_type`.

## 🎓 Concepts Learned

### 1. WAL (Write-Ahead Log)
- Every change in Postgres is first written to the WAL for durability. Debezium leverages this log to stay perfectly in sync with the DB state without polling.

### 2. SMT (Single Message Transforms)
- Debezium's `EventRouter` is an SMT that reshapes the database row into a clean Kafka message, extracting the payload and setting the Kafka key.

### 3. Consistency vs Latency
- The Outbox pattern adds a small amount of latency (DB commit -> CDC detection -> Kafka), but it provides much stronger consistency guarantees than manual sends.

## 🚀 How to Run
1. Update infrastructure: `docker-compose up -d`.
2. Run `OrderServiceApplication`.
3. **Register the Connector**:
   ```bash
   curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" \
     http://localhost:8083/connectors/ -d @infra/debezium-outbox-connector.json
   ```
4. **Test Outbox Flow**:
   ```bash
   curl -X POST "http://localhost:8082/api/orders/outbox?userId=userCDC&amount=150"
   ```
5. **Verify**:
   - Check the `orders` and `outbox_events` tables in Postgres.
   - Observe the `notification-service` logs; it should receive the event emitted by Debezium.

## ❓ Interview Questions
- **Explain the Transactional Outbox pattern.**
- **How does Debezium minimize the impact on database performance?** (By reading the WAL asynchronously instead of querying tables).
- **What is a "Snapshot" in Debezium?** (The initial process of reading existing data before starting to tail the WAL).
