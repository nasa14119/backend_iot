import { db } from "@db/connection";
import { bombTable, BombRegistre } from "@db/schema";
import { check_date_format, SELECT_UNTIL_DAY } from "@db/utils";
import { addMinute, isAfter } from "@formkit/tempo";
import { desc } from "drizzle-orm";
type NewBombRegistre = Omit<BombRegistre, "stamp">;
const WATER_COOLDOWN = process.env.BOMB_COOLDOWN_MINUTES
  ? Number(process.env.BOMB_COOLDOWN)
  : 1;
class BombControler {
  get_last_registre = async () => {
    const last_val = await db
      .select()
      .from(bombTable)
      .orderBy(desc(bombTable.stamp))
      .limit(1);
    if (!last_val || last_val.length <= 0) return null;
    return last_val[0];
  };
  get_all_registres = async () => {
    const last_val = await db
      .select()
      .from(bombTable)
      .orderBy(desc(bombTable.stamp));
    if (!last_val || last_val.length <= 0) return null;
    return last_val;
  };
  can_water = async (): Promise<boolean> => {
    const now = new Date();
    const last_value = await this.get_last_registre();
    if (!last_value) return true;
    const time = addMinute(last_value.stamp, WATER_COOLDOWN);
    return isAfter(now, time) && last_value.success;
  };
  push_value = async (new_registre: NewBombRegistre) => {
    const now = new Date();
    try {
      const result = await db
        .insert(bombTable)
        .values({ stamp: now, ...new_registre })
        .onConflictDoUpdate({
          target: bombTable.stamp,
          set: { ...new_registre },
        })
        .returning();
      if (!result || result.length <= 0) return null;
      const db_value: BombRegistre = result[0];
      return db_value;
    } catch (error) {
      console.error(error);
      console.error("Error pushing value to watet db");
      console.error("form");
      console.log(new_registre);
      throw new Error("Error while pushing value to db bomb");
    }
  };
  clear_until = async (date: string) => {
    const [error, day] = check_date_format(date);
    if (error !== null) {
      console.error("Error having error:");
      console.error(error);
      console.error(`from: ${date}`);
      throw new Error("Day pass is not has incorrect format");
    }
    try {
      await db.delete(bombTable).where(SELECT_UNTIL_DAY(day, bombTable.stamp));
    } catch (error) {
      console.error(error);
      throw new Error("Current delete value from water table");
    }
  };
  clear_all = async () => {
    try {
      await db.delete(bombTable);
    } catch (e) {
      console.error("Current delete the records error:");
      console.log(e);
    }
  };
}

export default new BombControler();
