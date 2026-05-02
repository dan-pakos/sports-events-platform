import type {
  FastifyPluginAsyncZod,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { createEventSchema } from "@sep/contracts";

const EventsRoutes: FastifyPluginAsyncZod = async (app) => {
  // CREATE Event (POST)
  app.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      schema: {
        description: "Create a new sports event",
        body: createEventSchema,
        response: {
          201: z.object({ id: z.uuid(), message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const payload = request.body;

      void payload; // tmp

      // TODO: Call gRPC service

      return reply.code(201).send({
        id: "uuid", // TODO: id from gRPC response
        message: "Event created successfully",
      });
    },
  );
};

export default EventsRoutes;
