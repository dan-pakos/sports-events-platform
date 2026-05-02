import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { createEventSchema, type CreateEventRequest } from "@sep/contracts";

export const createEventMethod = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      schema: {
        description: "Create a new sports event",
        body: createEventSchema,
        response: {
          201: z.object({
            id: z.uuid(),
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
      const payload = request.body as CreateEventRequest;

      const response = await app.grpcClients.events.createEvent(payload);

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
        id: response.event_id,
        message: "Event has been created successfully",
      });
    },
  );
};
