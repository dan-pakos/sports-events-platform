import { SportId } from "@sep/contracts";

export class Sport {
  #id: SportId;
  #name: string;
  #metadata: Record<string, any>;

  get id(): SportId {
    return this.#id;
  }

  get name(): string {
    return this.#name;
  }

  get metadata(): Record<string, any> {
    return this.#metadata;
  }

  constructor(id: SportId, name: string, metadata: Record<string, any>) {
    this.#id = id;
    this.#name = name;
    this.#metadata = metadata;
  }

  /**
   * Hydrates an object from a raw database row.
   */
  static fromPrisma(rawDbData: any): Sport {
    return new Sport(
      rawDbData.id as SportId,
      rawDbData.name,
      rawDbData.metadata || {},
    );
  }

  /**
   * Validates business rules for creating a brand new event.
   */
  static prepareNew(name: string, metadata: Record<string, any> = {}) {
    const cleanName = name.trim();

    // Name cannot be empty or too short
    if (cleanName.length < 2) {
      throw new Error("Sport name must be at least 2 characters long.");
    }

    // Name cannot exceed the database VARCHAR(50) limit
    if (cleanName.length > 50) {
      throw new Error("Sport name cannot exceed 50 characters.");
    }

    // Maybe validate metadate later...

    return {
      name: cleanName,
      metadata: metadata,
    };
  }
}
