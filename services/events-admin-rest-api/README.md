## Events Admin REST API

The public-facing API Gateway for the sports events catalog system. This service provides a read-optimized RESTful interface for the React frontend application to retrieve and display sporting events.

### Overview

This service acts as the primary ingress point for all public data retrieval. It follows a strict read-only policy, ensuring that the public web application can fetch data efficiently without having access to administrative write operations. It functions as a high-performance translation layer between HTTP REST and internal gRPC microservices.

### Running development

[See the Main README](../../README.md)

**Key Technologies:**

- **Fastify:** High-performance API framework.
- **Zod:** Schema validation with strict type-inference.
- **gRPC-JS:** Low-latency communication with backend services.
- **Swagger UI:** Automated OpenAPI 3.0 documentation for frontend developers.

### Documentation

Interactive Swagger UI and the OpenAPI 3.0 specification can be accessed locally when the service is running:

http://localhost:8053/documentation
