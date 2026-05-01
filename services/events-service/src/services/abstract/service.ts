import { join } from "path";
import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";

export default class Service {
  #protoRoot: string;

  constructor(protoRoot: string) {
    this.#protoRoot = protoRoot;
  }

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
