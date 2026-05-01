import { Server } from "@grpc/grpc-js";
import EventsService from "./events.service.ts";

export const addServices = (server: Server, protoRoot: string): void => {
  /**
   * Service: Events
   */
  const eventsService = new EventsService(protoRoot);

  server.addService(eventsService.proto.events.EventService.service, {
    createEvent: eventsService.createEvent,
  });
};
