import type * as grpc from "@grpc/grpc-js";

/**
 * Mapped types from events.proto schema
 */

export interface CreateEventParticipantGrpc {
  competitor_id: string;
  role: string;
}

export interface CreateEventRequestGrpc {
  sport_id: string;
  start_time: string;
  timezone: string;
  participants: CreateEventParticipantGrpc[];
}

export interface CreateEventResponseGrpc {
  success: boolean;
  event_id: string;
  status: string;
}

export interface EventsServiceClientGrpc extends grpc.Client {
  CreateEvent(
    request: CreateEventRequestGrpc,
    callback: (
      error: grpc.ServiceError | null,
      response: CreateEventResponseGrpc,
    ) => void,
  ): grpc.ClientUnaryCall;
}
