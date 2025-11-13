import { insert_data } from "@db/schema";

type Registre = {
  date: Date;
  temperature: number;
  humidity: number;
  capacity: number;
};
type ReturnRegistre = Promise<Registre | null>;
type ReturnNewRegistre = Promise<Registre>;
export type NewRegistre = Omit<insert_data, "date">;
type SensorData = Record<string, boolean>;
export interface TypeDataController {
  new_registre: (input: NewRegistre) => ReturnNewRegistre;
  get_last_registre: () => ReturnRegistre;
  get_by_date: (key: string) => Promise<Registre[] | null>;
  update_by_date: (
    key: Registre["date"],
    updating: Partial<NewRegistre>
  ) => ReturnRegistre;
  delete_by_date: (
    key: Registre["date"]
  ) => Promise<(Omit<Registre, "capacity"> & { sensors: SensorData }) | null>;
  clear_tables(): void;
  get_today(): Promise<Omit<Registre, "capacity">[]>;
}
export abstract class AbstractDataController implements TypeDataController {
  get_porcentage(sensors_db: SensorData): number {
    const sensors = Object.values(sensors_db);
    return (
      (sensors.reduce((p, v) => (v ? p + 1 : p), 0) / sensors.length) * 100
    );
  }
  // Create
  abstract new_registre: TypeDataController["new_registre"];
  // Read
  abstract get_last_registre: TypeDataController["get_last_registre"];
  abstract get_by_date: TypeDataController["get_by_date"];
  // Update
  abstract update_by_date: TypeDataController["update_by_date"];
  // Delete
  abstract delete_by_date: TypeDataController["delete_by_date"];
  abstract clear_tables: TypeDataController["clear_tables"];
  abstract get_today: TypeDataController["get_today"];
}
