import { desc, eq } from "drizzle-orm";
import { reset } from "drizzle-seed";
import { db } from "./connection";
import type { insert_data } from "./schema";
import { dataTable, sensorsTable } from "./schema";
import {
  AbstractDataController,
  TypeDataController,
} from "@db/template.controller";
class Controller extends AbstractDataController {
  new_registre: TypeDataController["new_registre"] = async (registre) => {
    try {
      const param_registre: insert_data = {
        date: new Date(),
        ...registre,
      };
      const new_val = await db.transaction(async (tx) => {
        const [val_data] = await tx
          .insert(dataTable)
          .values({ ...param_registre })
          .returning();
        const [{ date, ...sensors }] = await tx
          .insert(sensorsTable)
          .values({ ...param_registre, date: val_data.date })
          .returning();
        return { ...val_data, sensors };
      });
      return {
        date: new_val.date,
        temp: new_val.temp,
        humidity: new_val.humidity,
        capacity: this.get_porcentage(new_val.sensors),
      };
    } catch (error) {
      console.error("Error adding new registre");
      throw error;
    }
  };
  get_by_date: TypeDataController["get_by_date"] = async (key) => {
    return null;
  };
  update_by_date: TypeDataController["update_by_date"] = async (
    key,
    updating
  ) => {
    if (!key) throw Error("No key provided");
    const [current_val] = await db
      .select()
      .from(dataTable)
      .where(eq(dataTable.date, key))
      .fullJoin(sensorsTable, eq(dataTable.date, sensorsTable.date));
    if (!current_val) throw Error("No value found");
    try {
      const new_val = await db.transaction(async (tx) => {
        const [data] = await tx
          .update(dataTable)
          .set({ ...updating })
          .where(eq(dataTable.date, key))
          .returning();
        const [{ date, ...sensors }] = await tx
          .update(sensorsTable)
          .set({ ...updating })
          .where(eq(sensorsTable.date, key))
          .returning();
        return { ...data, sensors };
      });
      return {
        date: new_val.date,
        temp: new_val.temp,
        humidity: new_val.temp,
        capacity: this.get_porcentage(new_val.sensors),
      };
    } catch (error) {
      console.error("Update not process");
      throw error;
    }
  };
  clear_tables: TypeDataController["clear_tables"] = () => {
    try {
      reset(db, { dataTable, sensorsTable });
    } catch (error) {
      console.error("Deletion not complited");
      throw error;
    }
  };
  get_last_registre: TypeDataController["get_last_registre"] = async () => {
    try {
      const [last_val] = await db
        .select({
          data: dataTable,
          sensors_data: sensorsTable,
        })
        .from(dataTable)
        .fullJoin(sensorsTable, eq(dataTable.date, sensorsTable.date))
        .orderBy(desc(dataTable.date))
        .limit(1);
      if (!last_val.data?.date || !last_val.sensors_data) return null;
      const { date: _, ...sensors } = last_val.sensors_data;
      return {
        ...last_val.data,
        capacity: this.get_porcentage(sensors),
      };
    } catch (error) {
      console.error("Error geting value from db");
      throw error;
    }
  };
  delete_by_date: TypeDataController["delete_by_date"] = async (key) => {
    const [db_val] = await db
      .select()
      .from(dataTable)
      .where(eq(dataTable.date, key))
      .fullJoin(sensorsTable, eq(dataTable.date, sensorsTable.date))
      .limit(1);
    if (!db_val || !db_val.data || !db_val.sensors_data) {
      console.error(`Value no found ${key}`);
      return null;
    }
    const { date, ...sensors } = db_val.sensors_data;
    const deleted: Awaited<ReturnType<TypeDataController["delete_by_date"]>> = {
      sensors,
      date: db_val.data.date,
      humidity: db_val.data.humidity,
      temp: db_val.data.temp,
    };
    try {
      await db.delete(dataTable).where(eq(dataTable.date, key));
      return deleted;
    } catch (error) {
      console.error("Error while deleting value");
      throw error;
    }
  };
}

export default new Controller();
