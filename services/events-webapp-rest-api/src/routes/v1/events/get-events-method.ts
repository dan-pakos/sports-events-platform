import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import {
  getEventsSchema,
  GetEventsRequest,
  getEventsResponseSchema,
} from "@sep/contracts";

export const getEventsMethod = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/",
    {
      schema: {
        description: "Get single sports event",
        tags: ["Events"],
        querystring: getEventsSchema,
        response: {
          200: getEventsResponseSchema,
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
      const queryParams = request.query as GetEventsRequest;

      try {
        const events = await app.grpcClients.events.getEvents(queryParams);

        return reply.code(200).send(events);
      } catch (error) {
        // We don't want to expose other errors as API response, so log instead and return generic error
        app.log.error(error);

        return reply.code(500).send({
          message: "Internal Server Error",
        });
      }
    },
  );
};
