import bombController from "@db/bomb.controller";
import { querry_date } from "@type";
import Elysia from "elysia";
import { water_rutine } from "src/cron_rutines/water.rutine";
import z from "zod";

const route = new Elysia();
route.get("water/trigger", async ({ status }) => {
  await water_rutine();
  return status(204);
});
route.get("water", async ({ status }) => {
  const registeres = await bombController.get_all_registres();
  if (registeres === null) return status(204);
  return registeres;
});
route.get("water/get-status", async ({ status }) => {
  const registre = await bombController.get_last_registre();
  const can_water = await bombController.can_water();
  if (registre === null) return status(204);
  return { ...registre, can_water };
});
route.delete(
  "water/clear",
  async ({ status, query }) => {
    if (!query.date) {
      await bombController.clear_all();
      return status(204);
    }
    await bombController.clear_until(query.date);
    return status(204);
  },
  {
    query: z.object({
      date: z.optional(querry_date),
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
