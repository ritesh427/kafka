# Phase 7: Observability (Monitoring & Tracing)

## 🎯 Phase Goals
- Implement **Centralized Metrics** using Prometheus and Grafana.
- Monitor **Kafka-specific metrics** (Consumer Lag, throughput, error rates).
- Implement **Distributed Tracing** with OpenTelemetry and Jaeger.
- Visualize the **Event Journey** across multiple microservices.

## 🏗️ Architecture Decisions

### 1. Prometheus & Micrometer
- Each Spring Boot service uses **Micrometer** to collect internal metrics (JVM, Kafka Producers/Consumers, HTTP).
- Prometheus "scrapes" these metrics from the `/actuator/prometheus` endpoint.
- This allows us to see how many messages are being produced/consumed per second and identify slow listeners.

### 2. Distributed Tracing (OpenTelemetry + Jaeger)
- In a synchronous system, a request follows a thread. In an event-driven system, the "request" hops across multiple services via Kafka.
- **OpenTelemetry** injects a `traceparent` header into Kafka messages.
- Consumers extract this header and continue the trace, allowing **Jaeger** to show a unified timeline of an order's lifecycle across Order, Payment, and Inventory services.

### 3. Consumer Lag Monitoring
- Lag is the difference between the latest message in a topic and the last message processed by a consumer. High lag is a leading indicator of performance bottlenecks or system failure.

## 🛠️ Implementation Details
- **Infrastructure**: Added `prometheus`, `grafana`, and `jaeger` containers to `docker-compose.yml`.
- **`prometheus.yml`**: Configured to scrape metrics from the Spring Boot actuator endpoints.
- **Spring Boot Config**:
    - Enabled OTLP (OpenTelemetry Protocol) exporting to Jaeger.
    - Set sampling probability to `1.0` (100%) for development/learning purposes.

## 🎓 Concepts Learned

### 1. The Three Pillars of Observability
- **Metrics**: Aggregated data (e.g., "What is the average CPU usage?").
- **Traces**: Request-scoped data (e.g., "Why did Order #123 take 5 seconds to process?").
- **Logs**: Event-scoped data (e.g., "The payment service crashed at 10:00 AM").

### 2. Context Propagation
- This is the magic that makes tracing work in Kafka. The `traceId` is passed in the **Kafka Record Headers**, ensuring the trace context is not lost as it moves through the broker.

### 3. Golden Signals
- Monitor: **Latency**, **Traffic**, **Errors**, and **Saturation**.

## 🚀 How to Run
1. Update infrastructure: `docker-compose up -d`.
2. Run `OrderServiceApplication` (and others as they are updated with actuator).
3. **Prometheus**: `http://localhost:9090` (Search for `kafka_producer_records_produced_total_total`).
4. **Jaeger**: `http://localhost:16686` (Search for traces involving `order-service`).
5. **Grafana**: `http://localhost:3000` (Login: `admin/admin`).

## ❓ Interview Questions
- **How do you monitor consumer lag in production?** (Prometheus with Kafka Exporter or Micrometer Kafka metrics).
- **How does distributed tracing work across Kafka?** (Via header injection and extraction).
- **What is the difference between an 'active' and 'passive' check in monitoring?**
- **Explain 'Sampling' in the context of distributed tracing.**
