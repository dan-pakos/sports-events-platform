import { join } from "path";

import Fastify, {
  FastifyReply,
  FastifyRequest,
  type FastifyBaseLogger,
} from "fastify";

import { setupErrorHandler } from "./utils/error-handler.ts";
import env from "@fastify/env";
import schema from "./env-schema.ts";
import { createLogger } from "@sep/fastify-logger";

import fastifyCors from "@fastify/cors";
import fastifyAutoLoad from "@fastify/autoload";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";

import grpcEventsClientPlugin from "./grpc/events/grpc-events-plugin.ts";

/**
 * Create dedicated logger for event service
 */
const logger = createLogger({
  serviceName: "sep-events-webapp-rest-api",
  isProduction: process.env.NODE_ENV === "production",
});

// init Fastify app
const app = Fastify({
  loggerInstance: logger as FastifyBaseLogger,
});

/**
 * Setup error handler
 */
setupErrorHandler(app);

/**
 * Register env Plugin. Imporant: must be registered as first
 */
await app.register(env, { schema });

/**
 * Register grpcEventsClientPlugin
 */
await app.register(grpcEventsClientPlugin);

/**
 * Add schema validator and serializer
 */
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

/**
 * Register cors plugin
 */
await app.register(fastifyCors);

/**
 * Register Swagger plugin
 */
await app.register(fastifySwagger, {
  mode: "dynamic",
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Events WebApp REST API",
      description: "API Gateway for retrieving sporting events",
      version: "1.0.0",
    },
    servers: [],
  },
  transform: (opts) => {
    const transformed = jsonSchemaTransform(opts);
    const rawSchema = opts.schema as any;

    if (rawSchema?.examples?.length > 0 && transformed.schema?.body) {
      (transformed.schema.body as any).example = rawSchema.examples[0];
    }

    return transformed;
  },
});

/**
 * Register Swagger UI plugin
 */
await app.register(fastifySwaggerUi, {
  routePrefix: "documentation", // TODO: move to env vars
});

/**
 * Register API routes
 */
await app.register(fastifyAutoLoad, {
  dir: join(import.meta.dirname, "routes"), // folder to scan for routes
  forceESM: true, // force using ESM import
  indexPattern: /endpoints\.(ts|js)$/, // filename regex where endpoints are defined
});

app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  app.log.debug(
    { method: request.method, url: request.raw.url },
    "Route not found",
  );

  reply.status(404).send({
    statusCode: 404,
    error: "Not found",
    message: `Route ${request.method}:${request.raw.url} not found`,
  });
});

app.setErrorHandler(
  (err: Error, request: FastifyRequest, reply: FastifyReply) => {
    app.log.debug(
      { url: request.raw.url, body: request.body },
      "Failed request details",
    );
    app.log.error({ err }, "Error occurred");

    reply.status(500).send({
      statusCode: 500,
      error: err.name ?? "Internal server error.",
      message: err.message ?? err,
    });
  },
);

export default app;
