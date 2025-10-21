import { db } from "@db/connection";
import { eq } from "drizzle-orm";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as s from "drizzle-orm/sqlite-core";
export type Config = {
  board_ip: string | null;
  isOnline: boolean;
  ideal_temp: number;
  ideal_huminity: number;
};
export const default_config: Config = {
  board_ip: null,
  ideal_huminity: 2200,
  ideal_temp: 30,
  isOnline: false,
};
export const configTable = sqliteTable("config", {
  id: s.int().primaryKey({ autoIncrement: true }),
  values: s.text({ mode: "json" }).$type<Config>().default(default_config),
});

if (require.main === module) {
  (async () => {
    const [current] = await db.select().from(configTable);
    console.log(current.values);
    if (!current) {
      await db.insert(configTable).values({ values: { ...default_config } });
      return;
    }
    await db
      .update(configTable)
      .set({ values: { ...default_config, ...current } })
      .where(eq(configTable.id, 1));
  })();
}
