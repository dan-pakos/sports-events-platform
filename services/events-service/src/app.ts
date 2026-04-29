import Fastify, { type FastifyInstance } from "fastify";
import env from "@fastify/env";
import schema from "./env-schema.ts";

const app = Fastify({
  logger: true,
});

/**
 * Register env Plugin. Imporant: must be registered as first
 */
await app.register(env, { schema });

export { app, FastifyInstance };
