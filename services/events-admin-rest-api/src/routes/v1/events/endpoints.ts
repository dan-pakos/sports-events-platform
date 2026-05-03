import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createEventMethod } from "./create-event-method.ts";
import { deleteEventMethod } from "./delete-event-method.ts";

const EventsRoutes: FastifyPluginAsyncZod = async (app) => {
  createEventMethod(app); // CREATE Event (POST)
  deleteEventMethod(app); // DELETE Event (DELETE)
};

export default EventsRoutes;
