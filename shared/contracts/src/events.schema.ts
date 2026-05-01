import { z } from "zod";

export { ZodError, type ZodIssue } from "zod";

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
      }),
    )
    .min(2),
});

// Infer the TypeScript type from the Zod schema
export type CreateEventRequest = z.infer<typeof createEventSchema>;

export type CreateEventResponse = CreateEventSuccess | CreateEventFailure;

interface CreateEventSuccess {
  success: true;
  event_id: string;
  status: string;
}

interface CreateEventFailure {
  success: false;
  error: string;
  code: string;
}
