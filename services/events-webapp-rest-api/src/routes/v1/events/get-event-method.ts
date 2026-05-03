import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import {
  getEventSchema,
  GetEventRequest,
  getEventResponseSchema,
} from "@sep/contracts";

export const getEventMethod = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/:id",
    {
      schema: {
        description: "Get single sports event",
        tags: ["Events"],
        params: getEventSchema,
        response: {
          200: getEventResponseSchema,
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
      const payload = request.params as GetEventRequest;

      try {
        const event = await app.grpcClients.events.getEvent(payload);

        return reply.code(200).send(event);
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
