// Primitivs
export type EventId = string & { readonly __brand: unique symbol };
export type CompetitorId = string & { readonly __brand: unique symbol };
export type SportId = string & { readonly __brand: unique symbol };

// Prisma Enums
export type EventStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "CANCELED";
export type CompetitorType = "TEAM" | "INDIVIDUAL" | "PAIR";
