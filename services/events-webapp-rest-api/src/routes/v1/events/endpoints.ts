import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getEventMethod } from "./get-event-method.ts";
import { getEventsMethod } from "./get-events-method.ts";

const EventsRoutes: FastifyPluginAsyncZod = async (app) => {
  getEventMethod(app);
  getEventsMethod(app);
};

export default EventsRoutes;
