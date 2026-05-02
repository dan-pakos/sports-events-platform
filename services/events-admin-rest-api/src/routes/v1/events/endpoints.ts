import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createEventMethod } from "./create-event-method.ts";

const EventsRoutes: FastifyPluginAsyncZod = async (app) => {
  createEventMethod(app); // CREATE Event (POST)
};

export default EventsRoutes;
