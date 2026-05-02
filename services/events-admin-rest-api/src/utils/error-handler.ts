import type { FastifyError, FastifyInstance, FastifyReply } from "fastify";

export function setupErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, _, reply: FastifyReply) => {
    if (error.validation) {
      return reply.status(400).send({
        message: "The request payload contains invalid data.",
        errors: error.validation.map((err) => {
          const fieldName = err.instancePath
            .replace(/^\//, "")
            .replace(/\//g, ".");

          return {
            field: fieldName,
            message: err.message,
          };
        }),
      });
    }

    app.log.error(error);

    // Send a generic response
    return reply.status(500).send({
      message: "Internal Server Error",
    });
  });
}
