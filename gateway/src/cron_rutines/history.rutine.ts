import db from "@db/data.controller";
import { round_two } from "@db/utils";
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
};
history_rutine();
