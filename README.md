# AWS GameDay: The Frugal Architect - Cloud Optimization & Serverless Migration

This repository contains the source code and documents the architectural evolution of the "Unobserved Systems Solutions" application, optimized during the **AWS GameDay: The Frugal Architect** hackathon.

The core objective of this project was to practically apply Dr. Werner Vogels' 7 Laws of Frugal Architecture. The challenge required transforming a costly, over-provisioned legacy application into a highly efficient, cost-aware system while maintaining strict Service Level Agreements (SLAs).

## The Challenge & Success Criteria

The application processed a continuous stream of simulated customer traffic (20+ requests per second). The scoring was based on reducing the **Unit Cost** while successfully processing requests that met the following strict criteria:
* **HTTP 200 Response:** Successful transaction delivery.
* **Cryptographically Signed:** Validating responses using specific binaries (`secret_sauce_arm64`).
* **Latency SLA:** All responses returned in under 2000ms.

## Architectural Evolution

The optimization journey transitioned the application from a traditional EC2-based monolith to a fully Serverless architecture through the following technical phases:

### Phase 1: Legacy Architecture (The Baseline)
The initial setup was a synchronous Python (Flask) web application running on oversized x86 Amazon EC2 instances behind an Application Load Balancer (ALB). The database tier utilized an Amazon Aurora PostgreSQL cluster on x86 processors. This architecture suffered from severe over-provisioning and high idle costs.

### Phase 2: Compute Optimization & Right-Sizing
* **Off-Hours Resource Scheduling:** Configured the Bastion Host Auto Scaling Group (ASG) to automatically scale down to 0 instances at 5 PM UTC and scale back up to 3 instances at 8 AM UTC, eliminating 15 hours of unnecessary daily compute costs.
* **AWS Graviton Migration:** Migrated the production EC2 web servers from older x86 generation instances to ARM-based **AWS Graviton2** processors (`t4g.small`). Simultaneously, the Amazon Aurora PostgreSQL database cluster was upgraded to Graviton instances (`db.r6g`) with zero downtime, significantly improving price-performance.
* **ASG Right-Sizing:** Adjusted the desired capacity of the production web server ASG to maintain a target CPU utilization between 40% and 60%, preventing both over-provisioning and SLA breaches.

### Phase 3: Asynchronous Decoupling & Spot Instances
* **Amazon SQS Integration:** Decoupled the heavy `/fleet-report` endpoint by implementing asynchronous message processing. Web instances were configured to push requests to an Amazon SQS queue, referenced dynamically via AWS Systems Manager Parameter Store.
* **Spot Instance Workers:** Deployed a dedicated Worker ASG to poll and process SQS messages. To maximize cost savings (up to 90%), this ASG was configured to exclusively use **Amazon EC2 Spot Instances**. We implemented best practices including multi-AZ flexibility, a price-capacity-optimized allocation strategy, and proactive capacity rebalancing across multiple Graviton instance types
