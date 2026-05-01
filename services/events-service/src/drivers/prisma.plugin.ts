import fp from "fastify-plugin";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// add prisma prop to fastify instance types
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin = fp(async (app) => {
  const pool = new pg.Pool({ connectionString: app.config.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await prisma.$connect();

  app.decorate("prisma", prisma);

  // Close connection when Fastify (app) shuts down
  app.addHook("onClose", async (server) => {
    await server.prisma.$disconnect();
    await pool.end();
  });
});

export default prismaPlugin;
