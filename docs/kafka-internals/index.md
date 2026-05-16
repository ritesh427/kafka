# Kafka Internals Deep Dive

This directory contains deep-dive study materials for understanding how Kafka works under the hood. To truly master Kafka, you must understand its mechanical sympathy with the OS and how it achieves high throughput and reliability.

## Index of Topics

### 1. Storage Internals
- **Log Segments & Index Files:** How Kafka stores messages sequentially on disk. Topics are divided into partitions, partitions are divided into segment files (`.log`), and `.index` and `.timeindex` files enable fast offset lookups.
- **Page Cache:** Why Kafka relies heavily on the OS Page Cache rather than JVM heap, allowing it to serve gigabytes of read traffic without garbage collection pauses.
- **Zero-Copy Transfer:** How Kafka uses `sendfile()` system calls to stream data directly from disk to the network socket, bypassing user-space.

### 2. Cluster Mechanics
- **KRaft & Controller Quorum:** How Kafka manages metadata without Zookeeper using an event-sourced Raft log.
- **Partition Leadership:** Every partition has a single leader broker. All reads and writes go to the leader.
- **Replication Protocol & ISR:** Followers fetch from the leader. The In-Sync Replica (ISR) list ensures data durability. Only brokers in the ISR are eligible for leadership if the leader crashes.

### 3. Consumer Mechanics
- **The Pull Model:** Consumers pull data from brokers at their own pace, preventing the broker from overwhelming them (backpressure).
- **Consumer Groups & Rebalancing:** How partitions are assigned to consumers and what happens when a consumer joins or leaves.
- **Offset Storage:** How the `__consumer_offsets` internal topic reliably tracks where each group is currently reading.

### 4. Advanced Concepts
- **Log Compaction:** How Kafka keeps only the latest value for a given key, effectively acting as an event-sourced Key-Value store (used internally for `__consumer_offsets` and by Kafka Streams KTables).
- **Exactly-Once Semantics (EOS):** How the Transaction Coordinator enables atomic multi-partition writes and how consumers read only committed data (`read_committed`).

*(Detailed pages for each topic will be generated in subsequent phases).*