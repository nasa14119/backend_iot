import { db } from "@db/connection";
import dataTable from "@db/data.controller";
import { dataHistory } from "@db/schema";
import { endDayParse, round_two, SELECT_DATE } from "@db/utils";
import { dayEnd, format, monthStart, weekStart } from "@formkit/tempo";
import { and, eq, gte, lte } from "drizzle-orm";
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
  get_week = async (date: string) => {
    const [error, day] = endDayParse(date);
    if (error != null) {
      console.error(error);
      return null;
    }
    const start = weekStart(day);
    const registres = await db
      .select()
      .from(dataHistory)
      .where(and(gte(dataHistory.stamp, start), lte(dataHistory.stamp, day)));
    if (!registres || registres.length <= 0) return null;
    return registres;
  };
  get_month = async (date: string) => {
    const [error, day] = endDayParse(date);
    if (error != null) {
      console.error(error);
      return null;
    }
    const start = monthStart(day);
    const registres = await db
      .select()
      .from(dataHistory)
      .where(and(gte(dataHistory.stamp, start), lte(dataHistory.stamp, day)));
    if (!registres || registres.length <= 0) return null;
    return registres;
  };
  analize_day = async (date: string) => {
    const day = await dataTable.get_by_date(date);
    if (!day) {
      console.error("Day not found returning");
      console.log(day);
      return;
    }

    const sum = day.reduce(
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
    const temp_average = round_two(sum.temp / day.length);
    const hum_average = round_two(sum.hum / day.length);
    const pH_average = round_two(sum.pH / day.length);
    const soil_average = round_two(sum.soil / day.length);
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
  get_all = async () => {
    const db_result = await db.select().from(dataHistory);
    if (!db_result || db_result.length <= 0) return null;
    return db_result;
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
