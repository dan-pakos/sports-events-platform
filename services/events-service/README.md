## Events Service

### Overview

The Events Service is the core gRPC microservice responsible for the lifecycle and persistence of sports data. It acts as the primary interface for the PostgreSQL database, using Prisma to manage complex relations between sports, competitors, and match schedules.

By utilizing binary Protocol Buffers (gRPC) for communication, it provides the platform with high-throughput, low-latency data processing while ensuring strict type safety across the entire monorepo.

### Core functionalities

**Data Persistence:** Manages the source of truth for all events and participant data.

**Internal Communication:** Provides a typed gRPC interface for the Events Admin REST API and Events WebApp REST API; as well for other internal services in the future.

**Domain Validation:** Enforces business rules and constraints during the event creation process.

**Shared Logic:**s Uses a unified contract system (@sep/contracts) to keep validation schemas consistent.
