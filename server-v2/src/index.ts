import { Elysia } from "elysia";
import { db } from "./db";

// routes
import auth from "./modules/auth";
import otp from "./modules/otp";
import split from "./modules/split";
import sale from "./modules/sale";

export { db };

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(auth)
  .use(otp)
  .use(split)
  .use(sale)
  .listen(process.env.PORT || 3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

// // Track Memory Usage Every 1 second
// setInterval(() => {
//   const memoryUsage = process.memoryUsage();
//   console.log(
//     `Memory Usage - RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(
//       2,
//     )} MB, Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(
//       2,
//     )} MB, Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(
//       2,
//     )} MB, External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
//   );
// }, 1000);
