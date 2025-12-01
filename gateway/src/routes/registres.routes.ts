import { z } from "zod";
import Elysia from "elysia";
import { querry_date } from "@type";
import dataController from "@db/data.controller";
import historyController from "@db/history.controller";
import { water_rutine } from "src/cron_rutines/water.rutine";

const route = new Elysia();
route.get("registres", async ({ status }) => {
  const registres = await historyController.get_all();
  if (registres === null) return status(204);
  return registres;
});
route.get("registres/day", async ({ status }) => {
  const registres = await dataController.get_today();
  if (!registres) return status(204);
  return registres;
});
route.get(
  "registres/week",
  async ({ query, status }) => {
    const registres = await historyController.get_week(query.date);
    if (!registres) return status(204);
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
route.get("water-plant", async ({ status }) => {
  await water_rutine();
  return status(204);
});
route.get(
  "registres/month",
  async ({ query, status }) => {
    const registres = await historyController.get_month(query.date);
    if (!registres) return status(204);
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
export default route;
