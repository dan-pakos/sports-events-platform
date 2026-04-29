import * as grpc from "@grpc/grpc-js";

type Creds = {
  rootCa: Buffer;
  serverCert: Buffer;
  serverKey: Buffer;
};

const getCredentials = (
  isProduction: boolean,
  creds: Creds | null,
): grpc.ServerCredentials => {
  if (!isProduction) {
    return grpc.ServerCredentials.createInsecure();
  }

  if (!creds) {
    throw new Error(
      "Production mode requires gRPC TLS credentials, but none were provided.",
    );
  }

  return grpc.ServerCredentials.createSsl(
    creds.rootCa,
    [
      {
        cert_chain: creds.serverCert,
        private_key: creds.serverKey,
      },
    ],
    true,
  );
};

export { getCredentials };
