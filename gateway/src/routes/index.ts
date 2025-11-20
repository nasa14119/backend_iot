import db from "@db/data.controller";
import history from "@db/history.controller";
import { Elysia, ValidationError } from "elysia";
import { querry_date, Registre } from "src/types";
import z from "zod";
const app = new Elysia();
app.get("helth", () => {
  console.log("Petticion got");
  return { status: 200 };
});
app.get(
  "registres/week",
  ({ query, status }) => {
    const registres = history.get_week(query.date);
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
