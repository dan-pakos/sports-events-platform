const schema = {
  type: "object",
  required: ["APP_HOST", "APP_PORT", "DATABASE_URL"],
  properties: {
    NODE_ENV: { type: "string", default: "production" },
    APP_HOST: { type: "string", default: "localhost" },
    APP_PORT: { type: "string", default: "3000" },
    DATABASE_URL: { type: "string" },
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
      DATABASE_URL: string;
      CA_PATH: string;
      CERT_PATH: string;
      KEY_PATH: string;
    };
  }
}

export default schema;
