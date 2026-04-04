import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import auth from "../../../modules/auth";
import otp from "../../../modules/otp";
import sale from "../../../modules/sale";
import split from "../../../modules/split";
import splitCategory from "../../../modules/split_category";

type TestApp = {
  handle(request: Request): Response | Promise<Response>;
};

type RequestOptions = {
  method: string;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
};

function buildUrl(path: string, query?: Record<string, string>) {
  const url = new URL(`http://localhost${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

async function request(app: TestApp, path: string, options: RequestOptions) {
  const headers = new Headers(options.headers);
  let body: string | undefined;

  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(options.body);
  }

  return app.handle(
    new Request(buildUrl(path, options.query), {
      method: options.method,
      headers,
      body,
    }),
  );
}

function expectValidationStatus(status: number) {
  expect([400, 422]).toContain(status);
}

describe("auth endpoints", () => {
  const app = new Elysia().use(auth);

  test("POST /auth/signin requires email and password", async () => {
    const response = await request(app, "/auth/signin", {
      method: "POST",
      body: {},
      headers: { "x-real-ip": "auth-signin-test" },
    });

    expectValidationStatus(response.status);
  });

  test("POST /auth/signup rejects invalid payload", async () => {
    const response = await request(app, "/auth/signup", {
      method: "POST",
      body: {
        firstName: "",
        lastName: "",
        email: "bad-email",
        password: "weak",
        confirmPassword: "different",
      },
      headers: { "x-real-ip": "auth-signup-test" },
    });

    expect(response.status).toBe(400);
  });

  test("POST /auth/refresh requires refresh token", async () => {
    const response = await request(app, "/auth/refresh", {
      method: "POST",
      body: {},
    });

    expectValidationStatus(response.status);
  });

  test("GET /auth/me requires bearer token", async () => {
    const response = await request(app, "/auth/me", {
      method: "GET",
    });

    expect(response.status).toBe(401);
  });

  test("POST /auth/logout requires bearer token", async () => {
    const response = await request(app, "/auth/logout", {
      method: "POST",
      body: {},
    });

    expect(response.status).toBe(401);
  });

  test("POST /auth/logout-all requires bearer token", async () => {
    const response = await request(app, "/auth/logout-all", {
      method: "POST",
      body: {},
    });

    expect(response.status).toBe(401);
  });
});

describe("otp endpoints", () => {
  const app = new Elysia().use(otp);

  test("POST /otp requires email and purpose", async () => {
    const response = await request(app, "/otp", {
      method: "POST",
      body: {},
      headers: { "x-real-ip": "otp-create-test" },
    });

    expectValidationStatus(response.status);
  });

  test("POST /otp/verify requires email, purpose, and code", async () => {
    const response = await request(app, "/otp/verify", {
      method: "POST",
      body: {},
    });

    expectValidationStatus(response.status);
  });
});

describe("sale endpoints", () => {
  const app = new Elysia().use(sale);

  test("GET /sales validates query", async () => {
    const response = await request(app, "/sales", { method: "GET" });
    expectValidationStatus(response.status);
  });

  test("GET /sales/range validates query", async () => {
    const response = await request(app, "/sales/range", { method: "GET" });
    expectValidationStatus(response.status);
  });

  test("POST /sales validates body", async () => {
    const response = await request(app, "/sales", {
      method: "POST",
      body: {},
    });
    expectValidationStatus(response.status);
  });

  test("PUT /sales/:id validates body", async () => {
    const response = await request(app, "/sales/sale-1", {
      method: "PUT",
      body: {},
    });
    expectValidationStatus(response.status);
  });

  test("DELETE /sales/:id validates body", async () => {
    const response = await request(app, "/sales/sale-1", {
      method: "DELETE",
      body: {},
    });
    expectValidationStatus(response.status);
  });
});

describe("split endpoints", () => {
  const app = new Elysia().use(split);

  test("GET /splits validates query", async () => {
    const response = await request(app, "/splits", { method: "GET" });
    expectValidationStatus(response.status);
  });

  test("GET /splits/:id validates query", async () => {
    const response = await request(app, "/splits/split-1", {
      method: "GET",
    });
    expectValidationStatus(response.status);
  });

  test("POST /splits validates body", async () => {
    const response = await request(app, "/splits", {
      method: "POST",
      body: {},
    });
    expectValidationStatus(response.status);
  });

  test("PUT /splits/:id validates body", async () => {
    const response = await request(app, "/splits/split-1", {
      method: "PUT",
      body: {},
    });
    expectValidationStatus(response.status);
  });

  test("DELETE /splits/:id validates query", async () => {
    const response = await request(app, "/splits/split-1", {
      method: "DELETE",
    });
    expectValidationStatus(response.status);
  });
});

describe("split category endpoints", () => {
  const app = new Elysia().use(splitCategory);

  test("GET /splits/categories validates query", async () => {
    const response = await request(app, "/splits/categories", {
      method: "GET",
    });
    expectValidationStatus(response.status);
  });

  test("GET /splits/categories/:id validates query", async () => {
    const response = await request(app, "/splits/categories/category-1", {
      method: "GET",
    });
    expectValidationStatus(response.status);
  });

  test("POST /splits/categories validates body", async () => {
    const response = await request(app, "/splits/categories", {
      method: "POST",
      body: {},
    });
    expectValidationStatus(response.status);
  });

  test("PUT /splits/categories/:id validates body", async () => {
    const response = await request(app, "/splits/categories/category-1", {
      method: "PUT",
      body: {},
    });
    expectValidationStatus(response.status);
  });

  test("DELETE /splits/categories/:id validates body", async () => {
    const response = await request(app, "/splits/categories/category-1", {
      method: "DELETE",
      body: {},
    });
    expectValidationStatus(response.status);
  });
});
