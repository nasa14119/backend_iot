import { Notification } from "@type";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { int, text } from "drizzle-orm/sqlite-core";

export const notificationTable = sqliteTable("notifications", {
  id: text({ mode: "text" }).primaryKey(),
  stamp: int({ mode: "timestamp_ms" }).notNull(),
  data: text({ mode: "json" }).$type<Notification>(),
});
