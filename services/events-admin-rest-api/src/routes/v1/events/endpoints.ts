import type {
  FastifyPluginAsyncZod,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { createEventSchema, type CreateEventRequest } from "@sep/contracts";

const EventsRoutes: FastifyPluginAsyncZod = async (app) => {
  // CREATE Event (POST)
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
            error: z.string(),
            code: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const payload = request.body as CreateEventRequest;

      const response = await app.grpcClients.events.createEvent(payload);

      if (!response.success) {
        return reply.code(400).send({
          error: response.error,
          code: response.code,
        });
      }

      return reply.code(201).send({
        id: response.event_id,
        message: "Event has been created successfully",
      });
    },
  );
};

export default EventsRoutes;
