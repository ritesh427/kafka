# Phase 4: Distributed Sagas (Choreography)

## 🎯 Phase Goals
- Implement the **Choreography-based Saga** pattern.
- Coordinate multiple microservices (Order, Payment, Inventory) via Kafka events.
- Handle **Eventual Consistency** across distributed state stores.
- Demonstrate **Compensating Transactions** (Distributed Rollbacks).

## 🏗️ Architecture Decisions

### 1. Choreography vs. Orchestration
- **Choreography (Used here)**: Services listen to events and decide their own next steps. There is no central "brain." This is highly decoupled but can be hard to visualize as the system grows.
- **Orchestration**: A central "Saga Manager" tells each service what to do. Easier to monitor but creates a central point of logic.

### 2. The Workflow
1. `order-service` emits `OrderCreatedEvent`.
2. `payment-service` consumes `OrderCreatedEvent`, attempts payment, and emits `PaymentProcessedEvent`.
3. `inventory-service` consumes `OrderCreatedEvent`, reserves stock, and emits `InventoryReservedEvent`.
4. `order-service` consumes both outcomes. If both succeed, the order is `CONFIRMED`.

### 3. Compensating Transactions
- In a distributed system, we cannot use a global database transaction (`BEGIN...COMMIT`).
- Instead, if Payment succeeds but Inventory fails, the Order Service must initiate a "rollback" by emitting an event to refund the payment. This is called a **Compensating Transaction**.

## 🛠️ Implementation Details
- **Avro Events**: Created `PaymentProcessedEvent.avsc` and `InventoryReservedEvent.avsc`.
- **`SagaOutcomeListener`**: A "join" point in the `order-service` that collects outcomes and decides the final order state.

## 🎓 Concepts Learned

### 1. Eventual Consistency
- The system is not consistent at every microsecond. There is a window of time where payment is done but inventory isn't yet. We design the UX and business logic to handle this "In-Progress" state.

### 2. Dual-Write Problem (Preview)
- When `payment-service` updates its DB and sends a Kafka event, what if the event send fails? The DB is updated but the rest of the system is out of sync. This is solved by the **Outbox Pattern** (Phase 6).

### 3. Idempotency in Sagas
- Because events can be redelivered, every step of the Saga must be idempotent (checked in Phase 3).

## 🚀 How to Run
1. Start infrastructure.
2. Run `Order`, `Payment`, `Inventory`, and `Notification` services.
3. **Success Scenario**: `curl -X POST "http://localhost:8082/api/orders/async?userId=user1&amount=50"`
    - Observe logs: Both services succeed, Order confirms.
4. **Payment Failure**: `curl -X POST "http://localhost:8082/api/orders/async?userId=fail_payment&amount=50"`
    - Observe logs: Payment fails, Order reports failure.
5. **Inventory Failure**: `curl -X POST "http://localhost:8082/api/orders/async?userId=fail_inventory&amount=50"`
    - Observe logs: Inventory fails, Order reports failure.

## ❓ Interview Questions
- **How do you handle a scenario where the Compensating Transaction itself fails?** (Retry topics or manual intervention queues).
- **What are the pros and cons of Choreography Sagas?**
- **How do you prevent "Livelocks" in a saga?**
