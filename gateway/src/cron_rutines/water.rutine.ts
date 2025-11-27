import cron, { Patterns as timer } from "@elysiajs/cron";
import Elysia from "elysia";
import bombController from "@db/bomb.controller";
import { ESP_TIMEOUT, SHODULE } from "src/const";
import { RegistreType } from "@type";
const URL_TRIGGER = `${process.env.GATEWAY}/water-plant`;
const URL_GET_REGISTRE = `${process.env.GATEWAY}/get_status`;
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
async function water_rutine() {
  if (!process.env.GATEWAY) throw Error("Gateway ENV not found");
  if (!(await bombController.can_water())) {
    console.log("Skiping water because water before");
    return;
  }
  try {
    const res = await fetch(URL_TRIGGER, {
      signal: AbortSignal.timeout(ESP_TIMEOUT),
    });
    const success = res.ok;
    const last_values = (await fetch(URL_TRIGGER, {
      signal: AbortSignal.timeout(ESP_TIMEOUT),
    }).then((v) => v.json())) as RegistreType;
    await bombController.push_value({
      new_level: last_values.level,
      soil: last_values.soil,
      success,
    });
    // TODO: agregar el tema de notificar
  } catch (err) {
    const error = err as Record<string, string>;
    if (error.name === "TimeoutError") {
      console.error("Esp timeout couldn't get answer");
    }
    return;
  }
}
water_rutine();
