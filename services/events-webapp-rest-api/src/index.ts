import fastify from "./app.ts";

try {
  await fastify.listen({
    port: parseInt(fastify.config.APP_PORT),
    host: fastify.config.APP_HOST,
  });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
