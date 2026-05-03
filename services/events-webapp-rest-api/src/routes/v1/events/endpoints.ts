import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getEventMethod } from "./get-event-method.ts";

const EventsRoutes: FastifyPluginAsyncZod = async (app) => {
  getEventMethod(app);
};

export default EventsRoutes;
