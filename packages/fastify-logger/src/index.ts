import pino, { Logger, LoggerOptions } from "pino";

export interface LoggerConfig {
  serviceName: string;
  isProduction: boolean;
  cloudWatchGroup?: string;
  cloudWatchRegion?: string;
}

export const createLogger = (config: LoggerConfig): Logger => {
  const { serviceName, isProduction, cloudWatchGroup, cloudWatchRegion } =
    config;

  const options: LoggerOptions = {
    level: isProduction ? "info" : "debug",
    redact: {
      paths: [
        "req.headers.authorization",
        "password",
        "*.password",
        "user.email",
        "token",
        "*.token",
      ],
      remove: true,
    },
    base: {
      service: serviceName,
      env: isProduction ? "production" : "development",
    },
  };

  if (isProduction) {
    return pino(
      options,
      pino.transport({
        target: "@alexlau811/pino-cloudwatch",
        options: {
          group: cloudWatchGroup || `/sep/${serviceName}`,
          aws_region: cloudWatchRegion || "eu-central-1",
          interval: 1000, // maybe move to options
        },
      }),
    );
  }

  // Development transport
  return pino(
    options,
    pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "SYS:standard",
      },
    }),
  );
};
