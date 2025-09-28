import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as T from "drizzle-orm/sqlite-core";
export const dataTable = sqliteTable("data", {
  date: T.int({ mode: "timestamp_ms" }).primaryKey().unique(),
  temp: T.int().notNull(),
  huminity: T.numeric({ mode: "number" }).notNull(),
});
export const sensorsTable = sqliteTable("sensors_data", {
  date: T.int({ mode: "timestamp_ms" })
    .primaryKey()
    .references(() => dataTable.date),
  sensor_1: T.int({ mode: "boolean" }),
  sensor_2: T.int({ mode: "boolean" }),
  sensor_3: T.int({ mode: "boolean" }),
});

export type insert_data = typeof dataTable.$inferInsert;
export type select_data = typeof dataTable.$inferSelect;
