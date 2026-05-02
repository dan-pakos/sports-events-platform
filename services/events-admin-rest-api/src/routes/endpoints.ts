import type { FastifyInstance } from "fastify";
import { createRequire } from "module";

const requireJson = createRequire(import.meta.url);
const packageJson = requireJson("../../package.json");

const apiRoutes = async (fast: FastifyInstance) => {
  // health check
  fast.get("/", () => `Service ${packageJson.name} is working.`);

  fast.get("/version", async () => {
    return { version: packageJson.version };
  });
};

export default apiRoutes;
