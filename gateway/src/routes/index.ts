import db from "@db/data.controller";
import history from "@db/history.controller";
import { Elysia } from "elysia";
import { querry_date, Registre } from "src/types";
import z from "zod";
const app = new Elysia();
app.get("/", () => {
  return "Server up";
});
app.get("helth", () => {
  return { status: 200 };
});
app.get("registre", async ({ status }) => {
  const registre = await db.get_last_registre();
  if (!registre) return status(204);
  return registre;
});
app.get(
  "registres/week",
  async ({ query, status }) => {
    const registres = await history.get_week(query.date);
    if (!registres) return status(404, { error: "Element not found" });
    return registres;
  },
  {
    query: z.object({
      date: querry_date,
    }),
    error({ code, error, status }) {
      if (code === "VALIDATION") {
        return status(400, { error: error.customError });
      }
      return { error };
    },
  }
);
app.post(
  "registre",
  async ({ body }) => {
    const value = await db.new_registre(body);
    return value;
  },
  {
    body: Registre,
    error: ({ status, error, code }) => {
      if (code === "PARSE") {
        return status(400, {
          error: "Error parsing body",
        });
      }
      if (code === "VALIDATION") {
        return status(400, {
          field: error.valueError?.path[0],
          error: error.valueError?.message,
        });
      }
      return status(500, { error: "Something unexpected happend" });
    },
  }
);
app.delete("/db/clear", ({ body, status }) => {
  const { password } = body as { password: string };
  if (!password) return status(400);
  if (process.env.DELETE_DB_PASSWORD === password) {
    db.clear_tables();
    return status(204);
  }
  return status(401);
});
export default app;
