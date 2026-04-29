import Fastify, { type FastifyInstance, type FastifyBaseLogger } from "fastify";
import env from "@fastify/env";
import schema from "./env-schema.ts";
import { createLogger } from "@sep/fastify-logger";

const logger = createLogger({
  serviceName: "sep-events-service",
  isProduction: process.env.NODE_ENV === "production",
});

const app = Fastify({
  loggerInstance: logger as FastifyBaseLogger,
});

/**
 * Register env Plugin. Imporant: must be registered as first
 */
await app.register(env, { schema });

export { app, FastifyInstance };
