## Events Admin REST API

The API Gateway for the sports events management system. This service provides a RESTful interface for administrators to create, manage, and delete sporting events, teams, and competitors.

### Overview

This service acts as the primary ingress point for administrative operations. It does not connect directly to a database. Instead, it operates as a gateway that translates incoming HTTP REST requests into gRPC calls to backend domain microservices.

### Running development

[See the Main README](../../README.md)

**Key Technologies:**

- Fastify (API Framework)
- Zod (Schema Validation)
- gRPC-JS (Microservice Communication)
- Swagger UI (Interactive Documentation)

### Documentation

Interactive Swagger UI and the OpenAPI 3.0 specification can be accessed locally when the service is running:

http://localhost:8043/documentation
