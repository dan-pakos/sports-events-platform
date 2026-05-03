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
        tags: ["Events"],
        body: createEventSchema,
        examples: [
          {
            sport_id: "55555555-5555-5555-5555-555555555555",
            start_time: "2026-05-15T20:00:00Z",
            timezone: "Europe/Warsaw",
            participants: [
              {
                competitor_id: "11111111-1111-1111-1111-111111111111",
                role: "TEAM",
              },
              {
                competitor_id: "22222222-2222-2222-2222-222222222222",
                role: "TEAM",
              },
            ],
          },
        ],
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

      try {
        const response = await app.grpcClients.events.createEvent(payload);

        return reply.code(201).send({
          id: response.event_id,
          message: "Event has been created successfully",
        });
      } catch (error) {
        const grpcError = error as Error & { code?: number };
        // NOTE: 13 code in gRPC is INVALIDATION_ERROR
        // TODO: Move to shared error type
        if (grpcError.code === 13) {
          // TODO: handle mapping of invalidation errors
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
