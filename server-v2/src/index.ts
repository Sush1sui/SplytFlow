import { Elysia } from "elysia";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// routes
import auth from './modules/auth'

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL || "" });
export const dbClient = new PrismaClient({ adapter: pool });

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(auth)
  .listen(process.env.PORT || 3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
