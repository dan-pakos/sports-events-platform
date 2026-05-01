import { Server } from "@grpc/grpc-js";
import EventsService from "./events.service.ts";

export const addServices = (server: Server): void => {
  /**
   * Service: Events
   */
  const eventsService = new EventsService();

  server.addService(eventsService.proto.events.EventService.service, {
    createEvent: eventsService.createEvent,
  });
};
