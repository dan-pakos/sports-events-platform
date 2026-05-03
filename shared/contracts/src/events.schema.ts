import { z } from "zod";

export { ZodError, type ZodIssue } from "zod";

// CREATE

// shared schema for validating request for creating new event
export const createEventSchema = z.object({
  sport_id: z.uuid(),
  start_time: z.iso
    .datetime({
      offset: true,
    })
    .refine(
      (val) => {
        const startTime = new Date(val);
        const now = new Date();
        return startTime > now;
      },
      { message: "Cannot schedule an event in the past." },
    ),
  timezone: z
    .string()
    .min(1)
    .refine(
      (val) => {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: val });
          return true;
        } catch (err) {
          return false;
        }
      },
      { message: "Invalid timezone." },
    ),
  participants: z
    .array(
      z.object({
        competitor_id: z.uuid(),
        role: z.string(),
      }),
    )
    .min(2, "An event must have at least two participants."),
});

// Infer the TypeScript type from the Zod schema
export type CreateEventRequest = z.infer<typeof createEventSchema>;

export type CreateEventResponse = {
  event_id?: string;
};

// DELETE

export const deleteEventSchema = z.object({
  id: z.uuid(),
});

export type DeleteEventRequest = z.infer<typeof deleteEventSchema>;
export type DeleteEventResponse = {};

// GET EVENT

export const getEventSchema = z.object({
  id: z.uuid(),
});

const participantSchema = z.object({
  competitor_id: z.uuid(),
  role: z.string(),
});

export const getEventResponseSchema = z.object({
  id: z.uuid(),
  sport_id: z.uuid(),
  start_time: z.iso.datetime({ offset: true }),
  timezone: z.string(),
  status: z.string(),
  participants: z.array(participantSchema),
});

export type GetEventRequest = z.infer<typeof getEventSchema>;
export type GetEventResponse = z.infer<typeof getEventResponseSchema>;

// GET EVENTS

export const getEventsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.string().optional(),
  sport_id: z.uuid().optional(),
  sort: z.enum(["asc", "desc"]).default("asc"),
});

export const getEventsResponseSchema = z.object({
  events: z.array(getEventResponseSchema),
  meta: z.object({
    total_count: z.number().int().nonnegative(),
    total_pages: z.number().int().nonnegative(),
    current_page: z.number().int().min(1),
  }),
});

export type GetEventsRequest = z.infer<typeof getEventsSchema>;
export type GetEventsResponse = z.infer<typeof getEventResponseSchema>;
