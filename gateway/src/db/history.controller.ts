import { db } from "@db/connection";
import dataTable from "@db/data.controller";
import { dataHistory } from "@db/schema";
import { endDayParse, round_two, SELECT_DATE } from "@db/utils";
import { dayEnd, format } from "@formkit/tempo";
import { eq } from "drizzle-orm";
type NewRegistreHistory = typeof dataHistory.$inferInsert;
class HistoryController {
  push_value = async (
    new_registre: Omit<NewRegistreHistory, "date" | "stamp">
  ) => {
    const today = dayEnd(new Date());
    const date = format(today, "DD/MM/YY");
    const value_parsed: NewRegistreHistory = {
      ...new_registre,
      date,
      stamp: today,
    };
    try {
      await db.insert(dataHistory).values(value_parsed).onConflictDoUpdate({
        target: dataHistory.stamp,
        set: value_parsed,
      });
    } catch (error) {
      console.error(error);
      throw new Error("Something happend adding value to db");
    }
  };
  analize_day = async (date: string) => {
    const month = await dataTable.get_by_date(date);
    if (!month) {
      console.error("Month not found returning");
      console.log(month);
      return;
    }

    const sum = month.reduce(
      (
        { hum, temp, pH, soil },
        { temperature, humidity, pH: pH_temp, soil: soil_temp }
      ) => ({
        temp: temp + temperature,
        hum: humidity + hum,
        pH: pH + pH_temp,
        soil: soil + soil_temp,
      }),
      {
        temp: 0,
        hum: 0,
        pH: 0,
        soil: 0,
      }
    );
    const temp_average = round_two(sum.temp / month.length);
    const hum_average = round_two(sum.hum / month.length);
    const pH_average = round_two(sum.pH / month.length);
    const soil_average = round_two(sum.soil / month.length);
    const [err_parse, stamp] = endDayParse(date);
    if (err_parse !== null) throw new Error("Something wrong with date");
    const new_registre: NewRegistreHistory = {
      stamp,
      date,
      humidity: hum_average,
      temperature: temp_average,
      pH: pH_average,
      soil: soil_average,
    };
    await db.insert(dataHistory).values(new_registre).onConflictDoUpdate({
      target: dataHistory.stamp,
      set: new_registre,
    });
  };
  get_day = async (date: string) => {
    const [err_parsing, parse_date] = endDayParse(date);
    if (err_parsing !== null) {
      throw new Error(err_parsing);
    }
    const db_result = await db
      .select()
      .from(dataHistory)
      .where(eq(dataHistory.stamp, dayEnd(parse_date)));
    if (!db_result || db_result.length <= 0) {
      return null;
    }
    return db_result[0];
  };
  clear_db = async () => {
    await db.delete(dataHistory);
  };
  clear_day = async (date: string) => {
    const [err_parsing, parse_date] = endDayParse(date);
    if (err_parsing) {
      console.error(err_parsing);
      return;
    }
    await db.delete(dataHistory).where(SELECT_DATE(date, dataHistory.stamp));
  };
}
export default new HistoryController();
