import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { deleteEventSchema, DeleteEventRequest } from "@sep/contracts";

export const deleteEventMethod = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/:id",
    {
      schema: {
        description: "Delete sports event",
        tags: ["Events"],
        params: deleteEventSchema,
        response: {
          201: z.object({
            message: z.string(),
          }),
          400: z.object({
            message: z.string(),
            errors: z.array(
              z.object({
                field: z.string(),
                message: z.string(),
              }),
            ),
          }),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const payload = request.params as DeleteEventRequest;

      try {
        await app.grpcClients.events.deleteEvent(payload);

        return reply.code(201).send({
          message: "Event has been deleted successfully",
        });
      } catch (error) {
        const grpcError = error as Error & { code?: number };
        // Handle 404 from grpc
        // NOTE: 5 code in gRPC is NOT_FOUND
        // TODO: Move to shared error type
        if (grpcError.code === 5) {
          return reply.code(404).send({
            message: "Event with provided ID not found ",
          });
        }

        // We don't want to expose other errors as API response, so log instead and return generic error
        app.log.error(error);

        return reply.code(500).send({
          message: "Internal Server Error",
        });
      }
    },
  );
};
