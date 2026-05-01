# Sports Events Platform

Sports Events Platform

## Architecture

### Overview

![architecture-containers](/docs/architecture-containers.jpg)

### Services

#### Events Service

Located: `services/events-service`

The core gRPC microservice responsible for the lifecycle and persistence of sports events data.
[Events Service - README.md](/services/events-service/README.md)

#### Database

TODO

#### Events Admin REST API

Microservice with full CRUD (Create, Read, Update, Delete) operations for sports, teams, and individual athletes. It exposes REST API for **Events Admin**

Located: `services/events-admin-rest-api`

#### Events WebApp REST API

Microservice responsible for reads operations for sports events, sports, teams, and individual athletes.
It exposes REST API for **Events WebApp**

Located: `services/events-webapp-rest-api`

#### Events WebApp

TODO

#### Events Admin

TODO

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
