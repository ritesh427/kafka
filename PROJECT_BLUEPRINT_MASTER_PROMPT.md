# MASTER PROMPT: Kafka Mastery Distributed Laboratory

You are an expert Distributed Systems Architect. Below is the full blueprint of a production-grade Event-Driven E-Commerce Platform designed to teach advanced Apache Kafka patterns. Use this to understand, extend, or replicate the system.

---

## 🏗️ PROJECT OVERVIEW
A 10-microservice ecosystem built with **Java 17, Spring Boot 3, and Apache Kafka (KRaft mode)**. The project demonstrates eventual consistency, distributed transactions (Sagas), Change Data Capture (CDC), and real-time stream processing.

### 🛠️ Tech Stack
- **Messaging**: Kafka (3 Brokers, KRaft), Schema Registry (Avro).
- **Database**: PostgreSQL (with WAL logical replication), Redis (Caching/Idempotency).
- **CDC**: Debezium (Postgres Source Connector).
- **Streaming**: Kafka Streams API (Stateful Aggregations).
- **Frontend**: React 18, Vite, Tailwind CSS (Live Architecture Visualizer).
- **Observability**: Prometheus, Grafana, Jaeger (OTEL Distributed Tracing).

---

## 📂 DIRECTORY STRUCTURE
```text
/kafka-mastery-project
├── common-library/           # Shared Avro Schemas (.avsc) & Generated Java Classes
├── microservices/
│   ├── api-gateway/          # Port 9000: Centralized Routing
│   ├── user-service/         # Port 8088: User Profiles -> user-created (Topic)
│   ├── cart-service/         # Port 8090: Redis Carts -> cart-checked-out (Topic)
│   ├── order-service/        # Port 8082: Transactional Outbox -> order-created (Topic)
│   ├── payment-service/      # Port 8084: Saga Participant -> payment-processed (Topic)
│   ├── inventory-service/    # Port 8085: Saga Participant -> inventory-reserved (Topic)
│   ├── shipping-service/     # Port 8091: Consumer -> order-shipped (Topic)
│   ├── notification-service/ # Port 8087: Resilient Consumer (Retry/DLQ/Idempotency)
│   └── analytics-service/    # Port 8086: KStreams Real-time Sales Aggregation
├── infra/
│   ├── docker-compose.yml    # 12-container infrastructure
│   ├── prometheus/           # Scraper configs
│   └── debezium-outbox-connector.json # CDC Configuration
├── frontend/                 # React Visualizer
└── docs/                     # 10 Phases of Mastery Documentation
```

---

## 🚀 CORE WORKFLOWS (THE EVENT JOURNEY)

### 1. The Distributed Saga (Happy Path)
1. **User Service** emits `UserCreatedEvent`.
2. **Cart Service** manages items in Redis, then emits `CartCheckedOutEvent`.
3. **Order Service** (The Saga Manager):
    - Uses **Transactional Outbox Pattern**: Saves Order + Event to Postgres in one `@Transactional` block.
    - **Debezium CDC** tails the WAL and pushes `OrderCreatedEvent` to Kafka.
4. **Payment** & **Inventory** (Parallel Consumers):
    - React to `OrderCreatedEvent`.
    - Emit `PaymentProcessedEvent` and `InventoryReservedEvent`.
5. **Order Service** listens for both results:
    - If both SUCCESS -> Emits `OrderConfirmedEvent`.
6. **Shipping Service** listens to `OrderConfirmedEvent` -> Emits `OrderShippedEvent`.
7. **Notification Service** listens to all -> Sends alerts.

### 2. Resilience & Error Handling
- **Non-blocking Retries**: Consumers use `@RetryableTopic` for transient failures (Network/Locking).
- **Dead Letter Queues (DLQ)**: Poison Pills are routed to `topic-dlt` after 3 failed attempts.
- **Idempotency**: Notification service uses **Redis (Set-If-Absent)** with `correlationId` to ensure exactly-once processing.

---

## 🧪 KAFKA INTERNALS DEMONSTRATED
- **Avro & Schema Registry**: Enforced data contracts and schema evolution.
- **KRaft Mode**: Modern metadata management without Zookeeper.
- **Idempotent Producers**: `enable.idempotence=true` for exactly-once publishing.
- **Manual Acks**: `ack-mode: manual_immediate` for precise offset control.
- **KStreams**: Stateful processing using **KTables** and **RocksDB** state stores.
- **Zero-Copy**: Leveraged by Kafka brokers for high-throughput disk-to-network transfer.

---

## 📈 OBSERVABILITY FLOW
- **Metrics**: Micrometer -> Actuator -> Prometheus -> Grafana.
- **Tracing**: OpenTelemetry (OTEL) -> Trace Context injected in Kafka Headers -> Jaeger.
- **Visualization**: React Frontend animates the flow by simulating the Saga state machine based on API triggers.

---

## 🏁 USAGE INSTRUCTIONS
1. `docker-compose up -d`
2. `curl ... connectors/` (Register Debezium)
3. Run microservices (Port range 8080-8091).
4. `npm run dev` in `/frontend`.
