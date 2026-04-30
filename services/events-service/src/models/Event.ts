import { EventId, SportId, EventStatus, CompetitorId } from "./types.ts";

export interface Participant {
  competitorId: CompetitorId;
}

export class Event {
  #id: EventId;
  #sportId: SportId;
  #startTime: Date;
  #timezone: string;
  #status: EventStatus;
  #participants: Participant[];
  #metadata: Record<string, any>;

  get id(): EventId {
    return this.#id;
  }

  get sportId(): SportId {
    return this.#sportId;
  }

  get startTime(): Date {
    return this.#startTime;
  }

  get timezone(): string {
    return this.#timezone;
  }

  get status(): EventStatus {
    return this.#status;
  }

  get participants(): Participant[] {
    return this.#participants;
  }

  get metadata(): Record<string, any> {
    return this.#metadata;
  }

  constructor(
    id: EventId,
    sportId: SportId,
    startTime: Date,
    timezone: string,
    status: EventStatus,
    participants: Participant[],
    metadata: Record<string, any>,
  ) {
    this.#id = id;
    this.#sportId = sportId;
    this.#startTime = startTime;
    this.#timezone = timezone;
    this.#status = status;
    this.#participants = participants;
    this.#metadata = metadata;
  }

  /**
   * Hydrates an object from a raw database row.
   */
  static fromPrisma(rawDbData: any): Event {
    return new Event(
      rawDbData.id as EventId,
      rawDbData.sportId as SportId,
      new Date(rawDbData.startTime),
      rawDbData.timezone,
      rawDbData.status as EventStatus,
      rawDbData.participants || [],
      rawDbData.metadata || {},
    );
  }

  /**
   * Validates business rules for creating a brand new event.
   */
  static prepareNew(
    sportId: SportId,
    startTime: Date,
    timezone: string,
    participants: { competitorId: CompetitorId | null }[],
    metadata: Record<string, any> = {},
  ) {
    const now = new Date();

    // Cannot schedule an event in the past
    if (startTime <= now) {
      throw new Error("Cannot schedule an event in the past.");
    }

    // Must have at least two participants
    if (participants.length < 2) {
      throw new Error("An event must have at least two participants.");
    }

    // Must include valida timezone
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch (e) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    return {
      sportId,
      startTime,
      timezone,
      status: "SCHEDULED" as EventStatus,
      metadata,
      participants: participants.map((p) => ({
        competitorId: p.competitorId,
      })),
    };
  }

  /**
   * TODO: Add other business methods:
   * startMatch(), finishMatch(), cancelMatch()
   */
}
