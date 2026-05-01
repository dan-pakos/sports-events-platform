import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class Service {
  getPackageDefinition(relativePathToProto: string): any {
    try {
      const absolutePath = join(__dirname, relativePathToProto);
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
