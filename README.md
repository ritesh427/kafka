# Kafka Mastery Project

Welcome to the **Kafka Mastery Project**. This is a production-grade, event-driven microservices learning platform designed to deeply teach and demonstrate Apache Kafka internals, design patterns, and distributed systems concepts.

## 🎯 Primary Goals
This repository serves as a hands-on laboratory to understand:
- **Kafka Core Concepts:** Topics, Partitions, Offsets, Consumer Groups, Replication (ISR), Compaction, Delivery Guarantees, Rebalancing, and more.
- **Distributed Systems Patterns:** Saga Pattern (Choreography/Orchestration), Outbox Pattern, CQRS, CDC with Debezium, Event Sourcing, Circuit Breakers, Bulkheads.
- **Kafka Streams:** Stream processing, Windowing, Aggregations, KTables, and Stream-Table joins.
- **Real-World Scenarios:** Idempotency, Dead Letter Queues (DLQs), Retry mechanisms, failure recovery, and scaling implications.

## 🏗️ Architecture
We are simulating an **Event-Driven E-Commerce Platform**.
For full architectural details, see [docs/architecture.md](docs/architecture.md).

### Microservices:
1. API Gateway
2. User Service
3. Product Service
4. Inventory Service
5. Cart Service
6. Order Service
7. Payment Service
8. Notification Service
9. Shipping Service
10. Analytics Service

## 🚀 Phases of Development
This project is built phase-by-phase. Currently, we are at **Phase 9**.

- [x] **Phase 0:** Architecture + folder structure + docker infra
- [x] **Phase 1:** Basic microservices + Kafka setup ([docs/phase-1.md](docs/phase-1.md))
- [x] **Phase 2:** Producer/consumer deep dive ([docs/phase-2.md](docs/phase-2.md))
- [x] **Phase 3:** Retry/DLQ/idempotency ([docs/phase-3.md](docs/phase-3.md))
- [x] **Phase 4:** Saga patterns ([docs/phase-4.md](docs/phase-4.md))
- [x] **Phase 5:** Kafka Streams ([docs/phase-5.md](docs/phase-5.md))
- [x] **Phase 6:** Debezium + Outbox ([docs/phase-6.md](docs/phase-6.md))
- [x] **Phase 7:** Observability ([docs/phase-7.md](docs/phase-7.md))
- [x] **Phase 8:** Kubernetes + CI/CD ([docs/phase-8.md](docs/phase-8.md))
- [x] **Phase 9:** Performance tuning ([docs/phase-9.md](docs/phase-9.md))
- [x] **Phase 10:** Failure simulations ([docs/phase-10.md](docs/phase-10.md))

## 🏁 Project Completion: The Master Walkthrough
The system is now fully scaffolded. Below is your final guide to understanding and running the complete **Kafka Mastery Laboratory**.

### 🗺️ Codebase Map
- **`/common-library`**: The heart of our data contracts. Contains Avro schemas (`.avsc`) that ensure all 10 services speak the same language.
- **`/microservices/order-service`**: The Saga initiator. Demonstrates **Transactional Outbox**, **Idempotent Producers**, and **Sync/Async** patterns.
- **`/microservices/payment-service` & `/inventory-service`**: Saga participants demonstrating choreography and outcome emission.
- **`/microservices/notification-service`**: The resilient consumer. Demonstrates **Manual Acks**, **Redis Idempotency**, **Non-blocking Retries**, and **DLQs**.
- **`/microservices/analytics-service`**: The real-time engine. Demonstrates **Kafka Streams**, **KTable stateful aggregations**, and **Windowing**.
- **`/infra`**: The environment. Contains Docker, Prometheus, Grafana, and Jaeger configurations.

### 🛠️ Step-by-Step Verification Guide

#### Step 1: Start the Infrastructure
```bash
docker-compose up -d
# Wait 30s for Kafka and Connect to be ready
```

#### Step 2: Register the Debezium Outbox Connector
```bash
curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" \
  http://localhost:8083/connectors/ -d @infra/debezium-outbox-connector.json
```

#### Step 3: Run the Services
Run all services (Order, Notification, Payment, Inventory, Analytics). Ensure they point to `localhost:9092` and `localhost:8081` (Schema Registry).

#### Step 4: Execute a High-Level Flow
1. **Trigger an Order (Outbox Mode)**:
   ```bash
   curl -X POST "http://localhost:8082/api/orders/outbox?userId=ritesh&amount=500"
   ```
2. **Follow the Trace**: Open Jaeger (`http://localhost:16686`) and see the event travel from Order -> Payment -> Inventory -> Notification.
3. **Check Analytics**: Observe the `analytics-service` logs for real-time sales updates.
4. **Inspect Kafka UI**: Visit `http://localhost:8080` to see your topics, schemas, and consumer groups in action.

### 🎓 Key Technical Takeaways
1. **Mechanical Sympathy**: You learned how Kafka uses Page Cache and Zero-Copy for speed.
2. **Distributed Consistency**: You solved the Dual-Write problem using CDC.
3. **Resilience**: You built a system that handles failures without losing data or stalling.
4. **Observability**: You made a distributed system "debuggable" using OTEL.

---
*Congratulations! You have built a production-grade Kafka ecosystem from scratch.*
# Start the infrastructure
docker-compose up -d

# Check the status
docker-compose ps
```

### Expected Outputs
- Kafka UI is accessible at `http://localhost:8080`. You should see a cluster named `local` with 3 healthy brokers.
- PostgreSQL is available on port `5432`.
- Redis is available on port `6379`.

## 📚 Documentation
- [Kafka Internals Deep Dive](docs/kafka-internals/index.md)
- [Architecture Details](docs/architecture.md)

---
*Developed as a Staff+ Level Laboratory for Distributed Systems Mastery.*