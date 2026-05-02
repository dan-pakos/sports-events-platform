import type { ChannelCredentials } from "@grpc/grpc-js";
import Client, { type Certificates } from "./abstract/client.ts";

/**
 * Class representing gRPC Clients Factory
 */
export default class Clients extends Client {
  #proto: any;
  #credentials: ChannelCredentials;
  #serviceUrl: string;

  constructor(
    serviceUrl: string,
    isProd: boolean,
    certificates: Certificates | null,
    protoRoot: string,
    protoFile: string,
  ) {
    super(isProd, protoRoot);
    this.#serviceUrl = serviceUrl;
    this.#proto = this.getPackageDefinition(protoFile); // load proto file
    this.#credentials = this.getCredentials(certificates); // load credentials
  }

  /**
   * Creates a new gRPC client instance
   * @param packagePath
   * @param serviceName
   * @returns
   */
  create(packagePath: string, serviceName: string) {
    // Safely objectify packagePath
    let packageObj = this.#proto;
    for (const key of packagePath.split(".")) {
      packageObj = packageObj?.[key];
    }

    if (!packageObj || !packageObj[serviceName]) {
      throw new Error(
        `gRPC Service '${serviceName}' not found in package path '${packagePath}'.`,
      );
    }

    const ServiceConstructor = packageObj[serviceName];

    return new ServiceConstructor(this.#serviceUrl, this.#credentials);
  }
}
