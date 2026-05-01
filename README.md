# Sports Events Platform

This is a Monorepository for Sports Events Platform that manages scheduled sports events and exposes them for downstream consumers (web, mobile, internal services).
Events represent competitive sports matches and may evolve over time.

## Architecture

### Overview

![architecture-containers](/docs/architecture-containers.jpg)

### Future Scalability Roadmap

To handle high traffic and ensure system reliability, the infrastructure could evolve into a high-availability architecture focused on data accesability and latency reduction.

1. Redis Caching Layer

   A Redis service will be introduced between the **Events WebApp REST API** and the internal **Events Service** to store frequently accessed sports data.
   - Performance: Drastically reduces latency for "Hot Events" (e.g., live football matches) by serving data from memory rather than from the database.

   - Traffic Buffering: Will protects Events Service from spikes in read requests during peak tournament hours.

2. Primary-Replica Database Architecture

To scale database operations, the PostgreSQL infractructure will turn from a single instance to a Primary/Replica configuration.

Write Operations (Primary): All data modifications (creating, updating, deleting events) from **Events Admin REST API** will be handled by the Primary Database to ensure security, compliance and performance.

Read Operations (Replicas): Read traffic (fetching events lists, sports, etc) from **Events WebApp REST API** will be provided from multiple Read Replicas.

![architecture-containers](/docs/architecture-containers-scaling.jpg)

### Services

#### Events Service

Located: `services/events-service`

The core gRPC microservice responsible for the lifecycle and persistence of sports events data.
[Events Service - README.md](/services/events-service/README.md)

#### Database

##### Overview

The database is designed as a relational PostgreSQL schema, optimized for sports data consistency and high-speed querying. It utilizes a normalized structure to handle the relationships between sports, competing entities, and the events they participate in. Database chema has been designed to handle multiple sport types:

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

#### Events WebApp REST API

Microservice responsible for reads operations for sports events, sports, teams, and individual athletes.
It exposes REST API for **Events WebApp**

Located: `services/events-webapp-rest-api`

### Web Apps

#### Events WebApp

A future Web Application to present sports events to a public audience.

#### Events Admin

A future Web Application to allow manage events by an Admin.

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
