import * as grpc from "@grpc/grpc-js";
import Service from "./abstract/service.ts";
import { EventController } from "../controllers/event.ctrl.ts";
import type { PrismaClient } from "../generated/prisma/index.js";

const ErrorMap: Record<string, number> = {
  VALIDATION_ERROR: grpc.status.INVALID_ARGUMENT,
  NOT_FOUND: grpc.status.NOT_FOUND,
  INTERNAL_ERROR: grpc.status.INTERNAL,
};

/**
 * Class representing gRPC Events Service
 */
export default class EventsService extends Service {
  #protoFile: string = "events.proto";
  #proto: any;
  #ctrl: EventController;

  get proto() {
    return this.#proto;
  }

  constructor(protoRoot: string, prisma: PrismaClient) {
    super(protoRoot);
    this.#proto = this.getPackageDefinition(this.#protoFile); // load proto file
    this.#ctrl = new EventController(prisma);
  }

  /**
   * Public async method for handling gRPC create new event request
   * @param call
   * @param callback
   */
  createEvent = async (
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>,
  ) => {
    try {
      // process request via controller
      const result = await this.#ctrl.create(call.request);

      if (!result.success) {
        callback({
          code: ErrorMap[result.code] || grpc.status.UNKNOWN,
          details: result.error,
        });
      } else {
        // success
        callback(null, result);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";

      callback({
        code: grpc.status.INTERNAL,
        details: message,
      });
    }
  };
}
