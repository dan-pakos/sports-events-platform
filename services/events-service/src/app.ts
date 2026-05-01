import Fastify, { type FastifyInstance, type FastifyBaseLogger } from "fastify";
import env from "@fastify/env";
import schema from "./env-schema.ts";
import { createLogger } from "@sep/fastify-logger";
import prismaPlugin from "./drivers/prisma.plugin.ts";

/**
 * Create dedicated logger for event service
 */
const logger = createLogger({
  serviceName: "sep-events-service",
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
 * Register prisma plugin
 */
await app.register(prismaPlugin);

export { app, type FastifyInstance };
