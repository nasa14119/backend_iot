import { round_two } from "@db/utils";
import { convert_pH, convert_soil } from "src/util";
import z from "zod";
export type RegistreType = {
  temperature: number;
  humidity: number;
  level: number;
  soil: number;
  pH: number;
};
export type Notification = {
  message: string;
};
export const Registre = z.object({
  temperature: z.number().max(80),
  humidity: z.number().max(100).min(1),
  level: z.number().min(0).max(100),
  soil: z.number().min(0).max(100),
  pH: z.number().min(1).max(14),
});
export const RegistreRaw = z
  .object({
    temperature: z.number().max(80),
    humidity: z.number().max(100).min(1),
    level: z.number().min(0).max(100),
    soil: z.number().min(0).max(4095),
    pH: z.number().min(0).max(3400),
  })
  .transform((v) => {
    return {
      ...v,
      pH: round_two(convert_pH(v.pH)),
      soil: round_two(convert_soil(v.soil)),
    };
  });
export const querry_date = z
  .string()
  .regex(
    /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/,
    "Date must be in the format DD/MM/YY"
  );
