import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL || "" });
const dbClient = new PrismaClient({ adapter: pool });

export default dbClient;
