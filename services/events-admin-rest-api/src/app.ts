import { join } from "path";

import Fastify, {
  FastifyReply,
  FastifyRequest,
  type FastifyBaseLogger,
} from "fastify";

import env from "@fastify/env";
import schema from "./env-schema.ts";
import { createLogger } from "@sep/fastify-logger";

import fastifyCors from "@fastify/cors";
import fastifyAutoLoad from "@fastify/autoload";

import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import grpcEventsClientPlugin from "./grpc/events/grpc-events-plugin.ts";

/**
 * Create dedicated logger for event service
 */
const logger = createLogger({
  serviceName: "sep-events-admin-rest-api",
  isProduction: process.env.NODE_ENV === "production",
});

// init Fastify app
const app = Fastify({
  loggerInstance: logger as FastifyBaseLogger,
});

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
