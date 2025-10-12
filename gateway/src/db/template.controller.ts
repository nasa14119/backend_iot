import { insert_data } from "@db/schema";

type Registre = {
  date: Date;
  temp: number;
  capacity: number;
};
type ReturnRegistre = Promise<Registre | null>;
type ReturnNewRegistre = Promise<Registre>;
type NewRegistre = Omit<insert_data, "date">;
type SensorData = Record<string, boolean>;
export abstract class AbstractDataController {
  get_porcentage(sensors_db: SensorData): number {
    const sensors = Object.values(sensors_db);
    return (
      (sensors.reduce((p, v) => (v ? p + 1 : p), 0) / sensors.length) * 100
    );
  }
  // Create
  abstract new_registre(new_val: NewRegistre): ReturnNewRegistre;
  // Read
  abstract get_last_value(): ReturnRegistre;
  abstract get_by_date(key: Registre["date"]): ReturnRegistre;
  // Update
  abstract update_registre(
    key: Registre["date"],
    updating: Partial<NewRegistre>
  ): ReturnRegistre;
  // Delete
  abstract delete_by_date(key: Registre["date"]): ReturnRegistre;
  abstract clear_tables(): void;
}
