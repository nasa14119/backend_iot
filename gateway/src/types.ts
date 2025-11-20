import z from "zod";
export type RegistreType = {
  temperature: number;
  humidity: number;
  level: number;
  soil: number;
  pH: number;
};
export const Registre = z.object({
  temperature: z.number().max(80),
  humidity: z.number().max(100).min(1),
  level: z.number().min(0).max(100),
  soil: z.number().min(0).max(100),
  pH: z.number().min(1).max(14),
});

export const querry_date = z
  .string()
  .regex(
    /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/,
    "Date must be in the format DD/MM/YY"
  );
