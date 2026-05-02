import type {
  EventsServiceClientGrpc,
  CreateEventRequestGrpc,
  CreateEventResponseGrpc,
} from "@sep/contracts";

/**
 * Class representing Events Service from gPRC Events Service
 */
export class EventsClientWrapper {
  #client: EventsServiceClientGrpc;

  constructor(client: EventsServiceClientGrpc) {
    this.#client = client;
  }

  async createEvent(
    data: CreateEventRequestGrpc,
  ): Promise<CreateEventResponseGrpc> {
    return await this.#invoke("CreateEvent", data);
  }

  async #invoke<K extends keyof EventsServiceClientGrpc, TResponse>(
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
