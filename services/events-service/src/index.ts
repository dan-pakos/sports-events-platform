import * as fs from "fs";
import * as grpc from "@grpc/grpc-js";
import { app, type FastifyInstance } from "./app.ts";
import { getCredentials } from "./server-credentials.ts";

await startServer(app);

/**
 * Starts a GRPC server
 */
async function startServer(app: FastifyInstance): Promise<void> {
  const server = new grpc.Server();

  const isProd = app.config.NODE_ENV === "production";
  const certificates = isProd
    ? {
        rootCa: fs.readFileSync(app.config.CA_PATH),
        serverCert: fs.readFileSync(app.config.CERT_PATH),
        serverKey: fs.readFileSync(app.config.KEY_PATH),
      }
    : null;

  const credentials = getCredentials(isProd, certificates);

  try {
    const address = `${app.config.APP_HOST}:${app.config.APP_PORT}`;
    const port = await new Promise<number>((resolve, reject) => {
      server.bindAsync(address, credentials, (err, p) => {
        if (err) return reject(err);
        resolve(p);
      });
    });

    app.log.info(`gRPC Server listening on ${address} (and port: ${port})`);
  } catch (error) {
    app.log.error(error);
    server.forceShutdown();
    process.exit(1);
  }
}
