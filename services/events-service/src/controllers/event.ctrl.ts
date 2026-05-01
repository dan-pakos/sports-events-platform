import type { PrismaClient } from "./../generated/prisma/index.js";
import { Event } from "./../models/Event.ts";
import {
  SportId,
  CompetitorId,
  createEventSchema,
  CreateEventRequest,
  CreateEventResponse,
  ZodError,
} from "@sep/contracts";

/**
 * Class representing Event Controller
 * A controller responsible for business actions
 *
 */
export class EventController {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  /**
   * Public async method for creating new event
   * @param request
   * @returns
   */
  async create(request: CreateEventRequest): Promise<CreateEventResponse> {
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
      const insertedEvent = await this.#prisma.event.create({
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
      if (error instanceof ZodError) {
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
  }
}
