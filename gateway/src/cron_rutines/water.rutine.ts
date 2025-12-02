import cron, { Patterns as timer } from "@elysiajs/cron";
import Elysia from "elysia";
import bombController from "@db/bomb.controller";
import { ESP_TIMEOUT, SHODULE } from "src/const";
import { RegistreType } from "@type";
import dataController from "@db/data.controller";
import { registres } from "src/cron_rutines/registre.rutine";
import { publish } from "index";
const URL_TRIGGER = `${process.env.GATEWAY}/water-plant`;
export const WATER_SCHODULE = (app: Elysia) => {
  return SHODULE.forEach((time_of_day) =>
    app.use(
      cron({
        name: time_of_day,
        pattern: timer.everyDayAt(time_of_day),
        run: water_rutine,
      })
    )
  );
};
export async function water_rutine() {
  console.log("Wattering the plant");
  if (!process.env.GATEWAY) throw Error("Gateway ENV not found");
  if (!(await bombController.can_water())) {
    console.log("Skiping water because water before");
    publish("WATER_COOLDOWN_SHECHULE");
    return;
  }
  try {
    const res = await fetch(URL_TRIGGER, {
      signal: AbortSignal.timeout(ESP_TIMEOUT),
    }).catch(() => {
      throw { name: "TimeoutError" };
    });
    const success = res.ok;
    await registres();
    const last_values =
      (await dataController.get_last_registre()) as NonNullable<RegistreType>;
    await bombController.push_value({
      new_level: last_values.level,
      soil: last_values.soil,
      success,
    });
    success ? publish("WATER_SUCCESS") : publish("WATER_ERROR");
  } catch (err) {
    const error = err as Record<string, string>;
    publish("WATER_ERROR");
    if (error.name === "TimeoutError") {
      console.error("Esp timeout couldn't get answer");
      return;
    }
    console.log(error);
    return;
  }
}
