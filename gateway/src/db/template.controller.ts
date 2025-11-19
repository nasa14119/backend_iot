import { insert_data } from "@db/schema";

type Registre = {
  date: Date;
  temperature: number;
  humidity: number;
  level: number;
};
type ReturnRegistre = Promise<Registre | null>;
type ReturnNewRegistre = Promise<Registre>;
export type NewRegistre = Omit<insert_data, "date">;
type ClearFun = () => void;
export interface TypeDataController {
  new_registre: (input: NewRegistre) => ReturnNewRegistre;
  get_last_registre: () => ReturnRegistre;
  get_by_date: (key: string) => Promise<Registre[] | null>;
  update_by_date: (
    key: Registre["date"],
    updating: Partial<NewRegistre>
  ) => ReturnRegistre;
  delete_by_date: (key: Registre["date"]) => Promise<Registre | null>;
  clear_tables: ClearFun;
  clear_schema: ClearFun;
  get_today(): Promise<Omit<Registre, "capacity">[]>;
}
export abstract class AbstractDataController implements TypeDataController {
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
  abstract clear_schema: TypeDataController["clear_schema"];
  abstract get_today: TypeDataController["get_today"];
}
