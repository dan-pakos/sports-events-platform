import * as fs from "fs";
import fp from "fastify-plugin";
import GrpcClient from "@sep/grpc-client";
import { EventsClientWrapper } from "./grpc-events-client.ts";

// Extend FastifyInstance type to include custom clients
declare module "fastify" {
  interface FastifyInstance {
    grpcClients: {
      events: any;
    };
  }
}

const grpcEventsClientPlugin = fp(async (app) => {
  // define vars for the constructor
  const serviceUrl = app.config.EVENTS_SERVICE_URL;
  const isProd = app.config.NODE_ENV === `production`;
  const certificates = isProd
    ? {
        rootCa: fs.readFileSync(app.config.CA_PATH),
        serverCert: fs.readFileSync(app.config.CERT_PATH),
        serverKey: fs.readFileSync(app.config.KEY_PATH),
      }
    : null;
  const protoRoot = app.config.PROTO_ROOT;
  const protoFileName = `events.proto`;

  const grpcClient = new GrpcClient(
    serviceUrl,
    isProd,
    certificates,
    protoRoot,
    protoFileName,
  );

  const grpcEventsClient = grpcClient.create(`events`, `EventService`);

  app.decorate("grpcClients", {
    events: new EventsClientWrapper(grpcEventsClient),
  });

  app.addHook("onClose", (app, done) => {
    app.log.info("Closing gRPC client connections...");
    app.grpcClients.events.close();
    done();
  });
});

export default grpcEventsClientPlugin;
