import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as T from "drizzle-orm/sqlite-core";
export const dataTable = sqliteTable("data", {
  date: T.int({ mode: "timestamp_ms" }).primaryKey().unique(),
  temperature: T.int().notNull(),
  humidity: T.numeric({ mode: "number" }).notNull(),
  level: T.numeric({ mode: "number" }).notNull(),
});
export const dataHistory = sqliteTable("history", {
  stamp: T.int({ mode: "timestamp_ms" }).primaryKey().unique(),
  date: T.text().notNull(),
  temperature: T.int().notNull(),
  humidity: T.numeric({ mode: "number" }).notNull(),
});

export type insert_data = typeof dataTable.$inferInsert;
export type select_data = typeof dataTable.$inferSelect;
import type { NewRegistre } from "./template.controller";
export { NewRegistre };
