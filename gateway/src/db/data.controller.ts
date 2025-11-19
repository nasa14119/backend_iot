import { desc, eq } from "drizzle-orm";
import { reset } from "drizzle-seed";
import { db } from "./connection";
import type { insert_data } from "./schema";
import { dataTable } from "./schema";
import {
  AbstractDataController,
  TypeDataController,
} from "@db/template.controller";
import { SELECT_DATE, SELECT_DAY } from "@db/utils";
class Controller extends AbstractDataController {
  new_registre: TypeDataController["new_registre"] = async (registre) => {
    try {
      const param_registre: insert_data = {
        date: new Date(),
        ...registre,
      };
      const [val_data] = await db
        .insert(dataTable)
        .values({ ...param_registre })
        .returning();
      return val_data;
    } catch (error) {
      console.error("Error adding new registre");
      throw error;
    }
  };
  get_by_date: TypeDataController["get_by_date"] = async (key) => {
    try {
      const result = await db
        .select()
        .from(dataTable)
        .where(SELECT_DATE(key, dataTable.date));
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  update_by_date: TypeDataController["update_by_date"] = async (
    key,
    updating
  ) => {
    if (!key) throw Error("No key provided");
    const [current_val] = await db
      .select()
      .from(dataTable)
      .where(eq(dataTable.date, key));
    if (!current_val) throw Error("No value found");
    try {
      const [data] = await db
        .update(dataTable)
        .set({ ...updating })
        .where(eq(dataTable.date, key))
        .returning();
      return data;
    } catch (error) {
      console.error("Update not process");
      throw error;
    }
  };
  clear_tables: TypeDataController["clear_tables"] = () => {
    try {
      db.delete(dataTable);
    } catch (error) {
      console.error("Deletion not complited");
      throw error;
    }
  };
  clear_schema: TypeDataController["clear_schema"] = () => {
    try {
      reset(db, dataTable);
    } catch (error) {
      console.error("Deletion not complited");
      throw error;
    }
  };
  get_last_registre: TypeDataController["get_last_registre"] = async () => {
    try {
      const [last_val] = await db
        .select()
        .from(dataTable)
        .orderBy(desc(dataTable.date))
        .limit(1);
      if (!last_val) return null;
      return last_val;
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
      .limit(1);
    if (!db_val) {
      console.error(`Value no found ${key}`);
      return null;
    }
    try {
      const [deleted] = await db
        .delete(dataTable)
        .where(eq(dataTable.date, key))
        .returning();
      return deleted;
    } catch (error) {
      console.error("Error while deleting value");
      throw error;
    }
  };
  get_today: TypeDataController["get_today"] = async () => {
    // const todayEnd = dayEnd(new Date());
    const data = await db
      .select()
      .from(dataTable)
      .where(SELECT_DAY(dataTable.date));
    return data;
  };
}

export default new Controller();
