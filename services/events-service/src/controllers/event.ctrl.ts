import { z } from "zod";
import { PrismaClient } from "./../generated/prisma/index.ts";
import { Event } from "./../models/Event.ts";
import { SportId, CompetitorId } from "./../models/types.ts";

const prisma = new PrismaClient();

const createEventSchema = z.object({
  sport_id: z.string().uuid(),
  start_time: z.string().datetime({ offset: true }),
  timezone: z.string().min(1),
  participants: z
    .array(
      z.object({
        competitor_id: z.string().uuid(),
      }),
    )
    .min(2, "Must have at least 2 participants"),
});

export const CreateEvent = async (request: any): Promise<any> => {
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
      const zodError = error as z.ZodError;

      throw new Error(
        `Validation Error: ${zodError.issues.map((e) => e.message).join(", ")}`,
      );
    }
    if (error instanceof Error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
    throw new Error("An unknown error occurred while creating the event.");
  }
};
