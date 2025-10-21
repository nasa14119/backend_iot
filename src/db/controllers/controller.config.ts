import { Config, configTable, default_config } from "@db/config.schema";
import { db } from "@db/connection";
import { eq } from "drizzle-orm";

class ConfigController {
  static #instance: ConfigController | undefined;
  #config: Config | null;
  private constructor() {
    this.#config = null;
    this.fetch().then((f) => {
      if (!this.#config) this.#config = f;
      console.log(f);
    });
  }
  async fetch() {
    const [current] = await db
      .select()
      .from(configTable)
      .where(eq(configTable.id, 1));
    if (!current) {
      await db
        .insert(configTable)
        .values({ values: { ...default_config }, id: 1 });
      return default_config;
    }
    return current.values;
    // await db
    //   .update(configTable)
    //   .set({ values: { ...default_config, ...current } })
    //   .where(eq(configTable.id, 1));
  }
  async wait_config() {
    let attemps = 0;
    while (true) {
      attemps++;
      if (attemps > 10) throw Error("Function time out");
      if (this.#config !== null) return;
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
  async update(change: Partial<Config>) {
    // console.log(this.#config);
    if (this.#config === null) {
      await this.wait_config();
    }
    console.log(this.#config);
    // const new_val = {
    //   ...this.#config,
    //   ...Object.fromEntries(
    //     Object.entries(change).map(([key, value]) => [
    //       key,
    //       value ?? default_config[key as keyof Config],
    //     ])
    //   ),
    // };
    //   const [db_updated] = await db
    //     .update(configTable)
    //     .set({ values: { ...this.#config, ...change } })
    //     .where(eq(configTable.id, 1))
    //     .returning();
    //   this.#config = db_updated.values;
    // }
  }
  public static get instance(): ConfigController {
    if (!this.#instance) {
      this.#instance = new ConfigController();
    }
    return this.#instance;
  }
}
export const config_controller = ConfigController.instance;

await config_controller.update({ ideal_huminity: 1000 });
