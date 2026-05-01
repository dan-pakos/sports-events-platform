import { join } from "path";
import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";

/**
 * Class representing gRPC abstract service
 */
export default class Service {
  #protoRoot: string;

  constructor(protoRoot: string) {
    this.#protoRoot = protoRoot;
  }

  /**
   * Public method responsible for loading proto file
   * @param protoFile
   * @returns
   */
  getPackageDefinition(protoFile: string): any {
    try {
      const absolutePath = join(this.#protoRoot, protoFile);
      const packageDefinition = protoLoader.loadSync(absolutePath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const proto = grpc.loadPackageDefinition(
        packageDefinition,
      ) as unknown as any;

      return proto;
    } catch (err) {
      throw err;
    }
  }
}
