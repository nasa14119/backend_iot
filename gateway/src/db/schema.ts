import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as T from "drizzle-orm/sqlite-core";
export const dataTable = sqliteTable("data", {
  date: T.int({ mode: "timestamp_ms" }).primaryKey().unique(),
  temperature: T.int().notNull(),
  humidity: T.numeric({ mode: "number" }).notNull(),
});
export const sensorsTable = sqliteTable("sensors_data", {
  date: T.int({ mode: "timestamp_ms" })
    .primaryKey()
    .references(() => dataTable.date, { onDelete: "cascade" }),
  sensor_1: T.int({ mode: "boolean" }).notNull().default(false),
  sensor_2: T.int({ mode: "boolean" }).notNull().default(false),
  sensor_3: T.int({ mode: "boolean" }).notNull().default(false),
  sensor_4: T.int({ mode: "boolean" }).notNull().default(false),
});
export type insert_data = typeof dataTable.$inferInsert &
  typeof sensorsTable.$inferInsert;
export type select_data = typeof dataTable.$inferSelect &
  typeof sensorsTable.$inferSelect;
import type { NewRegistre } from "./template.controller";
export { NewRegistre };
