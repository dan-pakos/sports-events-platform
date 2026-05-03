import {
  type PrismaClient,
  Prisma,
  EventStatus,
} from "./../generated/prisma/index.js";
import { Event } from "./../models/Event.ts";
import { ZodError } from "@sep/contracts";
import {
  EventId,
  SportId,
  CompetitorId,
  createEventSchema,
  CreateEventRequest,
  DeleteEventRequest,
  GetEventRequest,
  GetEventsRequest,
} from "@sep/contracts";

type CreateEventResult = {
  success: boolean;
  event_id?: string;
  code?: string;
  error?: string;
};

type DeleteEventResult = {
  success: boolean;
  code?: string;
  error?: string;
};

export type EventData = {
  id: string;
  sport_id: string;
  start_time: string;
  timezone: string;
  status: string;
  participants: {
    competitor_id: string;
    role: string;
  }[];
};

export type GetEventResult =
  | { success: true; data: EventData }
  | { success: false; code: string; error: string };

export type GetEventsResult =
  | {
      success: true;
      data: {
        events: EventData[];
        meta: {
          total_count: number;
          total_pages: number;
          current_page: number;
        };
      };
    }
  | { success: false; code: string; error: string };

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
  async create(request: CreateEventRequest): Promise<CreateEventResult> {
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
                connect: {
                  id: p.competitorId as string,
                  role: p.role as string,
                },
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
      if (error instanceof ZodError) {
        return {
          success: false,
          code: "VALIDATION_ERROR",
          error: error.issues.map((e) => e.message).join(", "),
        };
      }

      // generic error
      throw error;
    }
  }

  /**
   * Public async method to delete an event
   * @param request
   * @returns
   */
  async delete(request: DeleteEventRequest): Promise<DeleteEventResult> {
    try {
      const id = request.id as EventId;

      if (!id) {
        return {
          success: false,
          code: "VALIDATION_ERROR",
          error: "ID is required",
        };
      }

      // Try to delete event from the database
      await this.#prisma.event.delete({
        where: { id: id },
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
            error: "Event with provided ID was not found",
          };
        }
      }

      // generic error
      throw error;
    }
  }

  /**
   * Public async method to get a single event
   * @param request
   * @returns
   */
  async getEvent(request: GetEventRequest): Promise<GetEventResult> {
    try {
      const id = request.id as EventId;

      if (!id) {
        return {
          success: false,
          code: "VALIDATION_ERROR",
          error: "ID is required",
        };
      }

      // Try to get event from the database
      const event = await this.#prisma.event.findUnique({
        where: {
          id: id,
        },
        include: {
          participants: true,
        },
      });

      if (!event) {
        return {
          success: false,
          code: "NOT_FOUND",
          error: "Event with provided ID was not found.",
        };
      }

      return {
        success: true,
        data: {
          id: event.id,
          sport_id: event.sportId,
          start_time: event.startTime.toISOString(),
          timezone: event.timezone,
          status: event.status,
          participants: event.participants.map((p) => ({
            competitor_id: p.competitorId,
            role: p.role ?? "",
          })),
        },
      };
    } catch (error) {
      // generic error
      throw error;
    }
  }

  async getEvents(request: GetEventsRequest): Promise<GetEventsResult> {
    try {
      const { page, limit, status, sport_id, sort } = request;

      const skip = (page - 1) * limit;
      const take = limit;

      // Apply filters
      const whereClause: Prisma.EventWhereInput = {};

      if (status) {
        whereClause.status = status as EventStatus;
      }
      if (sport_id) {
        whereClause.sportId = sport_id;
      }

      // Call all queries as transaction
      const [events, totalCount] = await this.#prisma.$transaction([
        // 1. Query - fidMany filtered
        this.#prisma.event.findMany({
          where: whereClause,
          skip: skip,
          take: take,
          orderBy: {
            startTime: sort === "desc" ? "desc" : "asc",
          },
          include: {
            participants: true,
          },
        }),

        // 2. Query - Count all events
        this.#prisma.event.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / take);

      return {
        success: true,
        data: {
          events: events.map((event) => ({
            id: event.id,
            sport_id: event.sportId,
            start_time: event.startTime.toISOString(),
            timezone: event.timezone,
            status: event.status,
            participants: event.participants.map((p) => ({
              competitor_id: p.competitorId,
              role: p.role ?? "",
            })),
          })),
          meta: {
            total_count: totalCount,
            total_pages: totalPages,
            current_page: page,
          },
        },
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";

      return {
        success: false,
        code: "INTERNAL_ERROR",
        error: message,
      };
    }
  }
}
