import dataController from "@db/data.controller";
import { Registre, RegistreRaw } from "@type";
import Elysia from "elysia";

const route = new Elysia();
route.get("registre", async ({ status }) => {
  const registre = await dataController.get_last_registre();
  if (!registre) return status(204);
  return registre;
});
route.post(
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
      return status(500, { error: "Something unexpected hrouteend" });
    },
  }
);
route.post(
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
export default route;
