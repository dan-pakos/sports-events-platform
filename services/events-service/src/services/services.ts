import { Server } from "@grpc/grpc-js";
import EventsService from "./events.service.ts";
import type { FastifyInstance } from "./../app.ts";

/**
 * Generic wrapper for adding all defined services
 * @param server
 * @param app
 */
export const addServices = (server: Server, app: FastifyInstance): void => {
  // Service: Events
  const eventsService = new EventsService(app.config.PROTO_ROOT, app.prisma);

  server.addService(eventsService.proto.events.EventsService.service, {
    createEvent: eventsService.createEvent,
  });
};
