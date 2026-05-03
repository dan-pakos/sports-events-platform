const schema = {
  type: "object",
  required: ["APP_HOST", "APP_PORT", "PROTO_ROOT"],
  properties: {
    NODE_ENV: { type: "string", default: "production" },
    APP_HOST: { type: "string", default: "localhost" },
    APP_PORT: { type: "string", default: "3000" },
    LOG_CLOUDWATCH_GROUP: { type: "string" },
    LOG_CLOUDWATCH_REGION: { type: "string" },
    PROTO_ROOT: { type: "string", default: "/var/web/shared/proto" },
    EVENTS_SERVICE_URL: { type: "string" },
    CA_PATH: { type: "string" },
    CERT_PATH: { type: "string" },
    KEY_PATH: { type: "string" },
  },
};

declare module "fastify" {
  interface FastifyInstance {
    config: {
      NODE_ENV: "development" | "production" | "test";
      APP_HOST: string;
      APP_PORT: string;
      LOG_CLOUDWATCH_GROUP: string;
      LOG_CLOUDWATCH_REGION: string;
      PROTO_ROOT: string;
      EVENTS_SERVICE_URL: string;
      CA_PATH: string;
      CERT_PATH: string;
      KEY_PATH: string;
    };
  }
}

export default schema;
