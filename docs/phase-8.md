# Phase 8: Kubernetes & CI/CD

## 🎯 Phase Goals
- Transition from Docker Compose to **Kubernetes (K8s)**.
- Understand K8s primitives: **Pods, Deployments, Services, ConfigMaps, and Secrets**.
- Implement **Health Checks** (Liveness/Readiness probes).
- Create a basic **CI/CD Pipeline** using GitHub Actions.
- Introduce **Helm** for package management.

## 🏗️ Architecture Decisions

### 1. From Docker Compose to Kubernetes
- **Docker Compose**: Great for local development, but doesn't handle scaling, self-healing, or complex networking well.
- **Kubernetes**: The industry standard for production. It manages container lifecycles, provides service discovery, and handles rolling updates.

### 2. Service Discovery & Config
- We use **K8s Services** (type `ClusterIP`) to provide stable DNS names for our microservices (e.g., `order-service`, `kafka-service`).
- **ConfigMaps** decouple configuration from the container image. The `kafka-config` ConfigMap allows us to change the bootstrap server address without rebuilding the Java code.

### 3. Self-Healing (Probes)
- **Liveness Probe**: Checks if the container is still running. If it fails, K8s kills the pod and starts a new one.
- **Readiness Probe**: Checks if the service is ready to accept traffic. If it fails, the pod is removed from the Service's load balancer.
- We use Spring Boot Actuator endpoints (`/actuator/health/liveness` and `/actuator/health/readiness`) for these probes.

## 🛠️ Implementation Details
- **`k8s/`**: Contains manifests for deploying the system to a K8s cluster (e.g., Minikube or Kind).
- **`Deployment`**: Defines the desired state for our pods (2 replicas for `order-service`).
- **`.github/workflows/maven.yml`**: A sample CI pipeline that builds the project and ensures the Docker images can be created.

## 🎓 Concepts Learned

### 1. Declarative Infrastructure
- You don't tell K8s *how* to start a container; you tell it the *state* you want, and the **K8s Controller** works to maintain that state.

### 2. Scaling & Load Balancing
- By increasing `replicas: 2`, K8s automatically distributes incoming traffic across both pods via the Service's internal load balancer.

### 3. Resource Management
- **Requests**: Guaranteed resources for a pod.
- **Limits**: Maximum resources a pod can consume.
- This is vital for cluster stability and preventing "noisy neighbor" problems.

## 🚀 How to Run
1. **Start a local K8s cluster**: `minikube start`.
2. **Apply manifests**:
   ```bash
   kubectl apply -f k8s/infra/common-config.yaml
   kubectl apply -f k8s/microservices/order-service/deployment.yaml
   ```
3. **Check status**: `kubectl get pods`.
4. **Access the service**: `minikube service order-service`.

## ❓ Interview Questions
- **What is the difference between a Deployment and a StatefulSet?** (StatefulSet is for stateful apps like Kafka/Postgres that need stable network IDs and persistent storage).
- **Explain the purpose of a Readiness probe.**
- **How does K8s handle a rolling update?** (It starts new pods and gradually kills old ones only after the new ones pass their readiness checks).
- **Why should you avoid using `latest` tags in production K8s manifests?** (It makes rollbacks difficult and causes ambiguity about what is actually running).
