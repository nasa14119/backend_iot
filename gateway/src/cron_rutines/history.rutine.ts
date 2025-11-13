import db from "@db/data.controller";
import { round_two } from "@db/utils";
import controller from "@db/history.controller";
export const history_rutine = async () => {
  const month = await db.get_today();
  const sum = month.reduce(
    ({ hum, temp }, { temperature, humidity }) => ({
      temp: temp + temperature,
      hum: humidity + hum,
    }),
    {
      temp: 0,
      hum: 0,
    }
  );
  const temp_average = round_two(sum.temp / month.length);
  const hum_average = round_two(sum.hum / month.length);
  try {
    await controller.push_value({
      temperature: temp_average,
      humidity: hum_average,
    });
  } catch (e) {
    console.error(e);
  }
};
