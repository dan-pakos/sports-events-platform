import type { Client, ServiceError, ClientUnaryCall } from "@grpc/grpc-js";
import type {
  CreateEventRequest,
  CreateEventResponse,
  GetEventRequest,
  GetEventResponse, 
} from "@sep/contracts";

export interface EventsServiceClient extends Client {
  GetEvent(
    request: CreateEventRequest,
    callback: (
      error: ServiceError | null,
      response: CreateEventResponse,
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

  async getEvent(data: GetEventRequest): Promise<GetEventResponse> {
    return await this.#invoke("GetEvent", data);
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
}
