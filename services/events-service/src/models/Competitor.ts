import { CompetitorId, SportId, CompetitorType } from "./types.js";

export class Competitor {
  #id: CompetitorId;
  #name: string;
  #type: CompetitorType;
  #sportId: SportId;
  #metadata: Record<string, any>;

  get id(): CompetitorId {
    return this.#id;
  }

  get name(): string {
    return this.#name;
  }

  get type(): CompetitorType {
    return this.#type;
  }

  get sportId(): SportId {
    return this.#sportId;
  }

  get metadata(): Record<string, any> {
    return this.#metadata;
  }

  constructor(
    id: CompetitorId,
    name: string,
    type: CompetitorType,
    sportId: SportId,
    metadata: Record<string, any>,
  ) {
    this.#id = id;
    this.#name = name;
    this.#type = type;
    this.#sportId = sportId;
    this.#metadata = metadata;
  }

  /**
   * Hydrates an object from a raw database row.
   */
  static fromPrisma(rawDbData: any): Competitor {
    return new Competitor(
      rawDbData.id as CompetitorId,
      rawDbData.name,
      rawDbData.type as CompetitorType,
      rawDbData.sportId as SportId,
      rawDbData.metadata || {},
    );
  }

  /**
   * Validates business rules for creating a brand new event.
   */
  static prepareNew(
    name: string,
    type: CompetitorType,
    sportId: SportId,
    metadata: Record<string, any> = {},
  ) {
    const cleanName = name.trim();

    // Name cannot be empty or too short
    if (cleanName.length < 2) {
      throw new Error("Sport name must be at least 2 characters long.");
    }

    // Name cannot exceed the database VARCHAR(100) limit
    if (cleanName.length > 100) {
      throw new Error("Sport name cannot exceed 100 characters.");
    }

    // Maybe validate metadate later...

    return {
      name: cleanName,
      type,
      sportId,
      metadata,
    };
  }
}
