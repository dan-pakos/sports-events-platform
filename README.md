# Sports Events Platform

This is a Monorepository for Sports Events Platform that manages scheduled sports events and exposes them for downstream consumers (web, mobile, internal services).
Events represent competitive sports matches and may evolve over time.

## Architecture

### Overview

The architecture has been designed to strictly separate external access from internal data processing, ensuring that every layer validates, authenticates data before it goes to the database.

![architecture-containers](/docs/architecture-containers.jpg)

### Domain-Driven Design

**Core Domain Entities**

1. Sport - The main category. It enforce rules for assotiated entities.
2. Competitor - An actor participating in a sport (Team, Individual). It can be associated once for a single event.
3. Event - A single instance of a competition. It owns schedule and status.
4. Event Participant - It shows how participant is involved in an Event (e.g. Role: HOME, AWAY, POSITION_1).
5. Admin User - The internal staff member authorized to manage the platform data.
6. Public Consumer - A service authorised to read the platform data.

**Domain Boundaries**

1. Sports Catalog
   - Entities: Sport, Competitor
   - Characteristics: High read volume, very low write volume. Changes very rarely.

2. Events Calendar
   - Entities: Event, EventParticipant
   - Characteristics: High read volume, moderate write volume. Changes frequently the `status` in an Event lifecycle.

3. Identity & Access Management (IAM)
   - Entities: Admin User, Public Consumer
   - Characteristics: Securing the platform. It lives in APIs layer. Handles authentication (login) and authorization (manages who can add or delete an Event)

### Security layer

The system flavors a SOA model where public-facing APIs (like the Events Admin REST API) act as the first line of defense - routing sanitized requests by strict schema validation via highly performant internal gRPC channels to isolated (behind private network) backend Events Service that connects to the database.

1. Entry-Point Security (The REST APIs layer)

   **Strict Payload Validation:** All incoming requests to the Events Admin REST API and Events WebApp REST API are validated via build-in Fastify request schema validator, then via shared Zod schemas. If a payload contains unexpected data or wrong types, the request is dropped before it hits the business logic.

2. Internal Transport Security (The Service Layer)

   **Binary gRPC Communication:** Internal microservices communicate strictly via gRPC. Because it uses binary Protocol Buffers instead of plaintext JSON, it is much more secure to injection attacks and payload tampering during transit.

   **Immutable Contracts:** Both the clients (Events Admin REST API and Events WebApp REST API) and the server (Events Service) rely on the same `@sep/contracts` package. A service cannot send or receive data that are different from the predefined .proto definitions.

3. Data Security (The Database Layer)

   **Isolated Database Access:** The database is completely hidden from the outside world. Only specific backend microservices (Events Service) holds the database credentials.

   **UUID Primary Keys:** Using randomly generated UUIDs across all models (Sports, Competitors, Events) prevents ID Enumeration Attacks.

   **Query Safety:** Prisma ORM automatically parametrizes all database queries, neutralizing SQL injection risk.

4. Code-Level Security (The Application Layer)

   **Strict Encapsulation:** The use of native JavaScript private fields (#) for service classes prevents context leaks or unauthorized property injection during runtime.

### Future Scalability Roadmap

To handle high traffic and ensure system reliability, the infrastructure could evolve into a high-availability architecture focused on data accesability and latency reduction.

![architecture-containers](/docs/architecture-containers-scaling.jpg)

1. Redis Caching Layer

   A Redis service will be introduced between the **Events WebApp REST API** and the internal **Events Service** to store frequently accessed sports data.
   - Performance: Drastically reduces latency for "Hot Events" (e.g., live football matches) by serving data from memory rather than from the database.

   - Traffic Buffering: Will protects Events Service from spikes in read requests during peak tournament hours.

2. Primary-Replica Database Architecture

   To scale database operations, the PostgreSQL infractructure will turn from a single instance to a Primary/Replica configuration.

   Write Operations (Primary): All data modifications (creating, updating, deleting events) from **Events Admin REST API** will be handled by the Primary Database to ensure security, compliance and performance.

   Read Operations (Replicas): Read traffic (fetching events lists, sports, etc) from **Events WebApp REST API** will be provided from multiple Read Replicas.

### Microservices

#### Events Service

Located: `services/events-service`

The core gRPC microservice responsible for the lifecycle and persistence of sports events data.
[Events Service - README.md](/services/events-service/README.md)

#### Database

##### Overview

The database is designed as a relational PostgreSQL schema, optimized for sports data consistency and high-speed querying. It utilizes a normalized structure to handle the relationships between sports, competing entities, and the events they participate in. Database schema has been designed to handle multiple sport types:

1. Team vs. Team – Football, Ice Hockey, Basketball, etc.
2. Individual vs. Individual – Tennis, Golf, etc.
3. Multiple Participants – Car Racing, etc.

#### Core Data Model

| **Entity**           | **Key Fields**                                     | **Description**                                                                                                                  |
| :------------------- | :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **Sport**            | `id`, `name`                                       | The top-level category (e.g., Football, Tennis).                                                                                 |
| **Competitor**       | `id`, `name`, `type`, `sportId`                    | The competing entities (Teams, Individuals, or Pairs). Each linked to a specific sport via a foreign key.                        |
| **Event**            | `id`, `startTime`, `timezone`, `status`, `sportId` | The central match. Stores scheduling data and tracks the event lifecycle from `SCHEDULED` to `FINISHED`.                         |
| **EventParticipant** | `eventId`, `competitorId`, `role`                  | A table managing the many-to-many relationship between Events and Competitors. Stores roles like `HOME` or `AWAY` or `POSITION`. |

---

#### Events Admin REST API

Microservice with full CRUD (Create, Read, Update, Delete) operations for sports, teams, and individual athletes. It exposes REST API for **Events Admin**

Located: `services/events-admin-rest-api`
Documentation: [README](./services/events-admin-rest-api/README.md)

#### Events WebApp REST API

Microservice responsible for reads operations for sports events, sports, teams, and individual athletes.
It exposes REST API for **Events WebApp**

Located: `services/events-webapp-rest-api`
Documentation: [README](./services/events-webapp-rest-api/README.md)

#### Events WebApp

TODO: The future Web Application to present sports events to a public audience.

#### Events Admin

TODO: The future Web Application to allow manage events by an Admin.

### Shared resources

#### Configs

Located: `shared/configs/`

Shared configuration files allows centralize configuration for shared modules across repository.

Included configs:

1. eslint-config - config for a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code

2. tsconfig-node - config for a TypeScript used by all node services

#### Contracts

Located: `shared/contracts/` and `shared/proto/`

The Shared Contracts package serves as the "single source of truth" for the entire monorepo, ensuring consistency between services. It includes all shared TypeScript types, validation schemas, and Protobuf definitions.

### Packages

#### Logger

Located: `packages/fastify-logger`

An abstracted logger package utilizing the Fastify Pino module. It features two transport modes:

**Development:** Provides human-readable, formatted logs to the console.

**Production:** Provides high-performance, structured JSON logging to cloud services (e.g. AWS CloudWatch).

## Setup

### Prerequisites

- [Make](https://www.gnu.org/software/make/)
- [Docker](https://www.docker.com/)

### Running development

Run the following from the root directory to bootstrap local development environment:

```bash
make dev
```

### Loading example data

To seed database with example data run the following with default container name (sep-events-service):

```bash
 docker exec -it sep-events-service //bin/bash -c "cd services/events-service && pnpx prisma db seed"
```

## Tools

1. **Turbo** - A high-performance build system optimized for JavaScript and TypeScript within monorepositories.
2. **pnpm** - An efficient package manager that saves disk space and simplifies monorepo workspace management.
3. **Fastify** - A next-generation Node.js framework for managing the application lifecycle (e.g., configuration) and schema validation. It supports automated documentation via Swagger.
4. **gRPC** - A modern, high-performance Remote Procedure Call (RPC) framework for internal microservice communication. It utilizes binary messages for both unary and streaming communication, enforced by contracts defined in Protocol Buffer (.proto) files.
5. **Prisma** - A leading ORM for JavaScript and TypeScript that features strong type validation, an intuitive query builder, and robust schema modeling for PostgreSQL databases.
