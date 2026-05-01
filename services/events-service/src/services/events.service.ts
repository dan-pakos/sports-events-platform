import * as grpc from "@grpc/grpc-js";
import Service from "./abstract/service.ts";
import { CreateEvent } from "../controllers/event.ctrl.ts";

const ErrorMap: Record<string, number> = {
  VALIDATION_ERROR: grpc.status.INVALID_ARGUMENT,
  NOT_FOUND: grpc.status.NOT_FOUND,
  INTERNAL_ERROR: grpc.status.INTERNAL,
};

export default class EventsService extends Service {
  protoPath: string = "./../protos/events.proto";
  proto: any;

  constructor() {
    super();
    this.proto = this.getPackageDefinition(this.protoPath);
  }

  async createEvent(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>,
  ) {
    try {
      const result = await CreateEvent(call.request);

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
  }
}
