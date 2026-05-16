# Phase 5: Kafka Streams (Real-time Analytics)

## 🎯 Phase Goals
- Master the **Kafka Streams API**.
- Understand **Stateless** vs **Stateful** processing.
- Implement **Windowing** for time-based aggregations.
- Use **KTables** and **State Stores** for persistent local state.
- Demonstrate real-time fraud detection and business metrics.

## 🏗️ Architecture Decisions

### 1. Streams API vs. Consumer API
- **Consumer API**: Best for simple processing where each message is independent.
- **Streams API (Used here)**: Specifically designed for complex transformations, joins, and aggregations. It handles state management, fault tolerance (via changelog topics), and repartitioning automatically.

### 2. Stateful Processing
- We use **State Stores** (backed by RocksDB locally and a changelog topic in Kafka) to keep track of running totals (e.g., total sales per user) without needing an external database like Redis or Postgres for every update.

### 3. Windowing
- **Tumbling Windows**: Fixed-size, non-overlapping time intervals (e.g., exactly 1 minute).
- **Hopping Windows**: Fixed-size, but can overlap.
- **Session Windows**: Dynamic size based on activity gaps.
- In this phase, we use a 1-minute window to count global order volume.

## 🛠️ Implementation Details
- **`AnalyticsStreamProcessor`**:
    - **Sales Aggregation**: Uses `.groupByKey()` and `.reduce()` to maintain a running total.
    - **Windowed Counts**: Uses `.windowedBy()` to count orders in 1-minute buckets.
    - **Fraud Filter**: Uses `.filter()` for stateless, high-value order detection.
- **RocksDB**: Kafka Streams uses RocksDB internally to store state. This allows for extremely fast local lookups while maintaining durability through Kafka changelogs.

## 🎓 Concepts Learned

### 1. KStream vs KTable
- **KStream**: An infinite, append-only stream of events (Facts).
- **KTable**: A changelog stream that represents the current state (Latest value for a key). Like a table in a RDBMS.

### 2. Event Time vs Wall-Clock Time
- Kafka Streams allows processing based on the timestamp *inside* the event (`createdAt`), rather than when the event arrived at the broker. This is crucial for handling out-of-order data.

### 3. Dual-Streaming
- Kafka Streams applications are essentially "Micro-Clusters." They can be scaled horizontally by simply running more instances with the same `application.id`.

## 🚀 How to Run
1. Start infrastructure.
2. Run `Order` and `Analytics` services.
3. **Generate Traffic**:
   ```bash
   # Normal orders
   curl -X POST "http://localhost:8082/api/orders/async?userId=user1&amount=100"
   curl -X POST "http://localhost:8082/api/orders/async?userId=user1&amount=50"
   # High value order (Fraud Alert)
   curl -X POST "http://localhost:8082/api/orders/async?userId=user2&amount=2000"
   ```
4. **Observe Logs**: The `analytics-service` will print real-time updates for total sales per user and windowed order counts.

## ❓ Interview Questions
- **How does Kafka Streams handle state if a pod/instance crashes?** (It recovers state from the internal changelog topic).
- **What is the difference between a Hopping and a Tumbling window?**
- **When should you use Kafka Streams instead of Flink or Spark Streaming?** (Kafka Streams is a library, not a cluster; great for microservices without extra infra management).
