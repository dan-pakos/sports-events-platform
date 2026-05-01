import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./../generated/prisma/index.js";
import { Event } from "./../models/Event.ts";
import { SportId, CompetitorId } from "./../models/types.ts";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const createEventSchema = z.object({
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
    .min(2, "Must have at least 2 participants"),
});

export type CreateEventRequest = z.infer<typeof createEventSchema>;

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

export type CreateEventResponse = CreateEventSuccess | CreateEventFailure;

export const CreateEvent = async (
  request: CreateEventRequest,
): Promise<CreateEventResponse> => {
  try {
    // 1. Validate the raw gRPC payload
    const parsedData = createEventSchema.parse(request);

    // 2. Map Zod data to strict types
    const sportId = parsedData.sport_id as SportId;
    const startTime = new Date(parsedData.start_time);
    const timezone = parsedData.timezone;
    const participants = parsedData.participants.map((p) => ({
      competitorId: p.competitor_id as CompetitorId,
    }));

    // 3. Model Execution (Business Constarins)
    const validNewEventData = Event.prepareNew(
      sportId,
      startTime,
      timezone,
      participants,
    );

    // 4. Insertion to DB (Prisma)
    const insertedEvent = await prisma.event.create({
      data: {
        sportId: validNewEventData.sportId,
        startTime: validNewEventData.startTime,
        timezone: validNewEventData.timezone,
        status: validNewEventData.status,
        metadata: validNewEventData.metadata,
        participants: {
          create: validNewEventData.participants.map((p) => ({
            competitor: {
              connect: { id: p.competitorId as string },
            },
          })),
        },
      },
    });

    return {
      success: true,
      event_id: insertedEvent.id,
      status: insertedEvent.status,
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        error: error.issues.map((e) => e.message).join(", "),
      };
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      code: "INTERNAL_ERROR",
      error: message,
    };
  }
};
