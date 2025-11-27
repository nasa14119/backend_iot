import db from "@db/data.controller";
import { round_two } from "@db/utils";
import controller from "@db/history.controller";
export const history_rutine = async () => {
  const day = await db.get_today();
  if (!day) return;
  const sum = day.reduce(
    (
      { hum, temp, pH, soil },
      { temperature, humidity, pH: ph_temp, soil: soil_temp }
    ) => ({
      temp: temp + temperature,
      hum: humidity + hum,
      pH: pH + ph_temp,
      soil: soil + soil_temp,
    }),
    {
      temp: 0,
      hum: 0,
      pH: 0,
      soil: 0,
    }
  );
  const temp_average = round_two(sum.temp / day.length);
  const hum_average = round_two(sum.hum / day.length);
  const ph_average = round_two(sum.pH / day.length);
  const soil_average = round_two(sum.soil / day.length);
  try {
    await controller.push_value({
      temperature: temp_average,
      humidity: hum_average,
      pH: ph_average,
      soil: soil_average,
    });
  } catch (e) {
    console.error(e);
  }
};
