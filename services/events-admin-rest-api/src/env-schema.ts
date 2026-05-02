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
  },
};

declare module "fastify" {
  interface FastifyInstance {
    config: {
      NODE_ENV: "development" | "production" | "test";
      APP_HOST: string;
      APP_PORT: string;
      CA_PATH: string;
      LOG_CLOUDWATCH_GROUP: string;
      LOG_CLOUDWATCH_REGION: string;
      PROTO_ROOT: string;
    };
  }
}

export default schema;
