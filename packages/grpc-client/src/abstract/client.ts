import { join } from "path";
import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";

export type Certificates = {
  rootCa: Buffer;
  serverCert: Buffer;
  serverKey: Buffer;
};

/**
 * Class representing gRPC Abstract Client
 */
export default class Client {
  #isProd: boolean;
  #protoRoot: string;

  constructor(isProd: boolean, protoRoot: string) {
    this.#isProd = isProd;
    this.#protoRoot = protoRoot;
  }

  /**
   * Public method responsible for loading proto file
   * @param protoFile
   * @returns
   */
  getPackageDefinition(protoFile: string): grpc.GrpcObject {
    try {
      const absolutePath = join(this.#protoRoot, protoFile);
      const packageDefinition = protoLoader.loadSync(absolutePath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      return grpc.loadPackageDefinition(packageDefinition);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Public method for resolving credentials
   * @param isProduction
   * @param creds
   * @returns grpc.ChannelCredentials
   */
  getCredentials(certificates: Certificates | null): grpc.ChannelCredentials {
    if (!this.#isProd) {
      return grpc.credentials.createInsecure();
    }

    if (!certificates) {
      throw new Error(
        "Production mode requires gRPC TLS credentials, but none were provided.",
      );
    }

    return grpc.credentials.createSsl(
      certificates.rootCa,
      certificates.serverKey,
      certificates.serverCert,
    );
  }
}
