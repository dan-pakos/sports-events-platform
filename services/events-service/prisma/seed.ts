import { PrismaClient } from "./../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...\n");

  await prisma.event.deleteMany();
  console.log("Cleared existing events.");

  // ==========================================
  // 1. SEED SPORTS
  // ==========================================
  const football = await prisma.sport.upsert({
    where: { name: "Football" },
    update: {},
    create: { name: "Football" },
  });

  const hockey = await prisma.sport.upsert({
    where: { name: "Ice Hockey" },
    update: {},
    create: { name: "Ice Hockey" },
  });

  const tennis = await prisma.sport.upsert({
    where: { name: "Tennis" },
    update: {},
    create: { name: "Tennis" },
  });

  // ==========================================
  // 2. SEED COMPETITORS
  // ==========================================
  // Football
  const salzburg = await prisma.competitor.upsert({
    where: { name_sportId: { name: "Salzburg", sportId: football.id } },
    update: {},
    create: { name: "Salzburg", sportId: football.id, type: "TEAM" },
  });
  const sturm = await prisma.competitor.upsert({
    where: { name_sportId: { name: "Sturm", sportId: football.id } },
    update: {},
    create: { name: "Sturm", sportId: football.id, type: "TEAM" },
  });

  // Ice Hockey
  const kac = await prisma.competitor.upsert({
    where: { name_sportId: { name: "KAC", sportId: hockey.id } },
    update: {},
    create: { name: "KAC", sportId: hockey.id, type: "TEAM" },
  });
  const capitals = await prisma.competitor.upsert({
    where: { name_sportId: { name: "Capitals", sportId: hockey.id } },
    update: {},
    create: { name: "Capitals", sportId: hockey.id, type: "TEAM" },
  });

  // Tennis
  const hailey = await prisma.competitor.upsert({
    where: { name_sportId: { name: "Hailey Baptistea", sportId: tennis.id } },
    update: {},
    create: {
      name: "Hailey Baptistea",
      sportId: tennis.id,
      type: "INDIVIDUAL",
    },
  });
  const mirra = await prisma.competitor.upsert({
    where: { name_sportId: { name: "Mirra Andreeva", sportId: tennis.id } },
    update: {},
    create: { name: "Mirra Andreeva", sportId: tennis.id, type: "INDIVIDUAL" },
  });

  // ==========================================
  // 3. SEED EVENTS & PARTICIPANTS
  // ==========================================

  // Event 1: Football Match
  await prisma.event.create({
    data: {
      startTime: new Date("2026-07-18T18:30:00Z"),
      sportId: football.id,
      participants: {
        create: [
          { competitorId: salzburg.id, role: "HOME" },
          { competitorId: sturm.id, role: "AWAY" },
        ],
      },
    },
  });

  // Event 2: Ice Hockey Match
  await prisma.event.create({
    data: {
      startTime: new Date("2026-10-23T09:45:00Z"),
      sportId: hockey.id,
      participants: {
        create: [
          { competitorId: kac.id, role: "HOME" },
          { competitorId: capitals.id, role: "AWAY" },
        ],
      },
    },
  });

  // Event 3: Tennis Match
  await prisma.event.create({
    data: {
      startTime: new Date("2026-11-13T08:00:00Z"),
      sportId: tennis.id,
      participants: {
        create: [
          { competitorId: hailey.id, role: "HOME" },
          { competitorId: mirra.id, role: "AWAY" },
        ],
      },
    },
  });

  console.log("Seeding completed");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
