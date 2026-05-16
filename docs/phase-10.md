# Phase 10: Failure Simulations (Chaos Engineering)

## 🎯 Phase Goals
- Verify the **Resiliency Patterns** built in Phases 1-9.
- Observe **Kafka Cluster Behavior** during broker failures.
- Understand **Consumer Group Rebalancing** in real-time.
- Test **Dead Letter Queues (DLQ)** and **Idempotency** under stress.

---

## 🧪 Simulation 1: The "Broker Crash" (High Availability)
**Goal**: Verify that the cluster stays alive even if 1 out of 3 brokers dies.

### Steps:
1. Start the cluster: `docker-compose up -d`.
2. Find the leader of the `order-created` topic in Kafka UI (`localhost:8080`).
3. Kill that specific broker: `docker-compose stop kafka-X` (where X is the leader ID).
4. **Observe**:
   - In Kafka UI, you will see a new leader being elected from the **ISR (In-Sync Replicas)**.
   - The `order-service` producer might experience a brief latency spike but should continue sending messages successfully because `acks=all` and we have 3 replicas.

---

## 🧪 Simulation 2: The "Poison Pill" (DLQ Verification)
**Goal**: Ensure a single bad message doesn't stall the entire pipeline.

### Steps:
1. Send a "permanent failure" trigger:
   ```bash
   curl -X POST "http://localhost:8082/api/orders/async?userId=fail_permanent&amount=10"
   ```
2. **Observe**:
   - The `notification-service` will try processing it once.
   - It will fail and immediately move to the `order-created-dlt` topic (check Kafka UI).
   - The consumer continues processing subsequent messages without delay.

---

## 🧪 Simulation 3: The "Transient Glitch" (Retry Verification)
**Goal**: Verify that non-blocking retries handle temporary network issues.

### Steps:
1. Send a "transient failure" trigger:
   ```bash
   curl -X POST "http://localhost:8082/api/orders/async?userId=fail_transient&amount=10"
   ```
2. **Observe**:
   - Log: "Transient failure for order ... Retrying..."
   - Log: You will see the message land in `order-created-retry-0` and then be picked up again after 1 second.
   - After 3 attempts (as configured in Phase 3), it will either succeed (if logic changed) or land in DLT.

---

## 🧪 Simulation 4: The "Consumer Death" (Rebalancing)
**Goal**: See how Kafka redistributes work when a consumer fails.

### Steps:
1. Run TWO instances of `notification-service`.
2. Check Kafka UI -> Consumer Groups -> `notification-group`. You'll see partitions divided between the two instances.
3. Kill one instance (Ctrl+C).
4. **Observe**:
   - Kafka logs will show a "Rebalance" being triggered.
   - The remaining instance will take over the partitions previously handled by the dead instance.
   - No messages are lost because the dead instance hadn't committed the offsets for its last messages.

---

## 🧪 Simulation 5: The "Duplicate Event" (Idempotency)
**Goal**: Ensure "At-Least-Once" delivery doesn't cause "Double Notifications."

### Steps:
1. In `OrderEventListener`, temporarily comment out `ack.acknowledge()`.
2. Send an order. Restart the `notification-service`.
3. Kafka will re-deliver the same message because the offset wasn't committed.
4. **Observe**:
   - Log: "Duplicate message detected for correlationId: ... Skipping..."
   - This proves our Redis-backed idempotency is protecting our business logic.

---

## 🎓 Final Mastery Summary
By completing these simulations, you have verified:
1. **Durability**: Messages survive broker crashes.
2. **Resilience**: The system self-heals from transient errors.
3. **Consistency**: Idempotency prevents duplicate processing.
4. **Availability**: New consumers automatically pick up the slack.
