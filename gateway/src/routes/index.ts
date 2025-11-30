import dataController from "@db/data.controller";
import { Elysia } from "elysia";
import { Registre, RegistreRaw } from "src/types";
import registres_routes from "./registres.routes";
import notification_routes from "@notifications/notification.route";
const app = new Elysia();
// General Porpuse
app.get("/", () => {
  return "Server up";
});
app.get("helth", () => {
  return { status: 200 };
});
app.use(notification_routes);
// Registres sub router
app.use(registres_routes);
app.get("registre", async ({ status }) => {
  const registre = await dataController.get_last_registre();
  if (!registre) return status(204);
  return registre;
});
app.post(
  "registre",
  async ({ body }) => {
    const value = await dataController.new_registre(body);
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
app.post(
  "registre/raw",
  async ({ body }) => {
    const value = await dataController.new_registre(body);
    return value;
  },
  {
    body: RegistreRaw,
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
    dataController.clear_tables();
    return status(204);
  }
  return status(401);
});
export default app;
