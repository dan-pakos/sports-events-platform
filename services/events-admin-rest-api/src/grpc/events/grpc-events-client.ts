import type { Client, ServiceError, ClientUnaryCall } from "@grpc/grpc-js";
import type {
  CreateEventRequest,
  CreateEventResponse,
  DeleteEventRequest,
  DeleteEventResponse,
} from "@sep/contracts";

export interface EventsServiceClient extends Client {
  CreateEvent(
    request: CreateEventRequest,
    callback: (
      error: ServiceError | null,
      response: CreateEventResponse,
    ) => void,
  ): ClientUnaryCall;
  DeleteEvent(
    request: DeleteEventRequest,
    callback: (
      error: ServiceError | null,
      response: DeleteEventResponse,
    ) => void,
  ): ClientUnaryCall;
}

/**
 * Class representing Events Service from gPRC Events Service
 */
export class EventsClientWrapper {
  #client: EventsServiceClient;

  constructor(client: EventsServiceClient) {
    this.#client = client;
  }

  async createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    return await this.#invoke("CreateEvent", data);
  }

  async #invoke<K extends keyof EventsServiceClient, TResponse>(
    methodName: K,
    data: unknown,
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      const method = this.#client[methodName] as Function;

      method.call(
        this.#client,
        data,
        (err: Error | null, response: TResponse) => {
          if (err) return reject(err);
          resolve(response);
        },
      );
    });
  }

  async deleteEvent(data: DeleteEventRequest): Promise<DeleteEventResponse> {
    return await this.#invoke("DeleteEvent", data);
  }
}
