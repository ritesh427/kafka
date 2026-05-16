# 🎓 Kafka Mastery: Complete Beginner's Guide & Flow Walkthrough

Welcome to the **Kafka Mastery Project**. If you are new to Kafka and Docker, this guide will take you from zero to understanding how a production-grade distributed system works.

---

## 🏗️ 1. Understanding the "Big Picture"
In a traditional app, Service A calls Service B directly (HTTP). If Service B is down, the app breaks.
In an **Event-Driven System** (this project):
- Services never talk to each other directly.
- They talk through **Kafka** (a massive, ultra-fast post office).
- If a service is down, the messages just wait in Kafka until it comes back up. **Nothing is lost.**

---

## 🛠️ 2. Step-by-Step Setup

### Step A: Start the Infrastructure (Docker)
Docker allows us to run 12 complex servers (Kafka, Postgres, etc.) with one command without installing them on your computer.
```bash
# 1. Go to the project root
cd kafka-mastery-project

# 2. Start everything
docker-compose up -d
```
**What just happened?** Docker created a virtual network and started 3 Kafka brokers (for reliability), a Database (Postgres), and monitoring tools (Grafana/Jaeger).

### Step B: Register the "Bridge" (CDC)
We use a pattern called the **Outbox Pattern**. Instead of the `order-service` sending to Kafka directly, it saves to a DB table. A tool called **Debezium** tails that DB and pushes to Kafka.
```bash
curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" \
  http://localhost:8083/connectors/ -d @infra/debezium-outbox-connector.json
```

### Step C: Start the Frontend (Visualizer)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

---

## 🚀 3. The "Happy Path" Code Flow
When you click **"Place Order"** in the UI, here is exactly what happens in the code:

1.  **Frontend**: Calls `POST /api/orders/outbox` on the `order-service`.
2.  **Order Service** (`OrderProducerService.java`): 
    - Starts a Database Transaction.
    - Saves the Order to the `orders` table.
    - Saves an "Event" to the `outbox_events` table.
    - **Commits**. This ensures the DB and the Event are always in sync.
3.  **Debezium (CDC)**: Sees the new row in `outbox_events` and immediately publishes it to the Kafka topic: `order-created`.
4.  **Payment & Inventory Services**:
    - They are "listening" to the `order-created` topic.
    - They wake up, process the payment/stock, and send their results back to Kafka topics (`payment-processed`, `inventory-reserved`).
5.  **Notification Service**:
    - Listens to `order-created`.
    - Checks Redis to ensure it hasn't sent this email before (**Idempotency**).
    - "Sends" the email and **Acknowledges** the message to Kafka.

---

## 🧪 4. Key Concepts You Are Learning

| Concept | What it solves | Where to see it in code |
| :--- | :--- | :--- |
| **Topics** | Categories for messages (e.g. `order-created`). | `common-library/src/main/avro` |
| **Consumer Groups** | Allows multiple instances to share the work. | `application.yml` (`group-id`) |
| **Saga Pattern** | Managing a transaction across 5 different services. | `SagaOutcomeListener.java` |
| **DLQ (Dead Letter)** | What to do with a "Poison Message" that keeps crashing? | `OrderEventListener.java` (`@DltHandler`) |
| **Idempotency** | Prevents "Double Charging" a user if a message is sent twice. | `OrderEventListener.java` (Redis check) |
| **Observability** | Finding out *why* something failed in a complex system. | Jaeger UI (`localhost:16686`) |

---

## 🛑 5. Failure Scenarios (The Real Mastery)
To truly understand Kafka, try to "break" it using the UI:
1.  **Payment Failure**: Watch the `order-service` receive a "FAILED" event and trigger a **Compensating Transaction** (marking the order as REJECTED).
2.  **Poison Pill**: Send a message that always crashes the consumer. Watch it move through **Retry Topics** and finally land in the **DLT** (Dead Letter Topic) so it doesn't block other customers.

---

## 📚 6. Folder Map
- `/infra`: The Docker "recipes" for your servers.
- `/common-library`: The shared schemas (Avro). Think of this as the "dictionary" all services share.
- `/microservices`: The Java logic for each piece of the business.
- `/docs`: Detailed deep-dives into every phase of this project.
