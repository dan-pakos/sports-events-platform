import { z } from "zod";

export { ZodError, type ZodIssue } from "zod";

// shared schema for validating request for creating new event
export const createEventSchema = z.object({
  sport_id: z.uuid(),
  start_time: z.iso.datetime({
    offset: true,
  }),
  timezone: z.string().min(1),
  participants: z
    .array(
      z.object({
        competitor_id: z.uuid(),
        role: z.string(),
      }),
    )
    .min(2),
});

// Infer the TypeScript type from the Zod schema
export type CreateEventRequest = z.infer<typeof createEventSchema>;

export type CreateEventResponse = {
  success: boolean;
  event_id?: string;
  code?: string;
  error?: string;
};
