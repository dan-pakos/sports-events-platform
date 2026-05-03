import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { deleteEventSchema, type DeleteEventRequest } from "@sep/contracts";

export const deleteEventMethod = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      schema: {
        description: "Delete sports event",
        tags: ["Events"],
        body: deleteEventSchema,
        examples: [
          {
            event_id: "55555555-5555-5555-5555-555555555555",
          },
        ],
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
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const payload = request.body as DeleteEventRequest;

      const response = await app.grpcClients.events.deleteEvent(payload);

      if (!response.success) {
        /**
         * We don't want to expose backend gRPC errors as client response
         */
        app.log.error(
          `Backend Service Error (${response.code}): ${response.message}`,
        );

        return reply.code(500).send({
          message: "Backend Service Error",
        });
      }

      return reply.code(201).send({
        message: "Event has been deleted successfully",
      });
    },
  );
};
