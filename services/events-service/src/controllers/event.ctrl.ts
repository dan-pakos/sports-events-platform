import { type PrismaClient, Prisma } from "./../generated/prisma/index.js";
import { Event } from "./../models/Event.ts";
import {
  EventId,
  SportId,
  CompetitorId,
  createEventSchema,
  CreateEventRequest,
  CreateEventResponse,
  DeleteEventRequest,
  DeleteEventResponse,
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
        role: p.role as string,
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
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        code: "INTERNAL_ERROR",
        error: message,
      };
    }
  }

  /**
   * Public async method to delete an event
   * @param request
   * @returns
   */
  async deleteEvent(request: DeleteEventRequest): Promise<DeleteEventResponse> {
    const event_id = request.event_id as EventId;

    try {
      // Try to delete event from the database
      await this.#prisma.event.delete({
        where: { id: event_id },
      });

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Prisma uses "P2025" when record is not found
        if (error.code === "P2025") {
          return {
            success: false,
            code: "NOT_FOUND",
            error: "Event with provided id has been not found",
          };
        }
      }

      // generic error
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        code: "INTERNAL_ERROR",
        error: message,
      };
    }
  }
}
