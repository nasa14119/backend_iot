import z from "zod";
export type RegistreType = {
  temperature: number;
  humidity: number;
  level: number;
};
export const Registre = z.object({
  temperature: z.number().max(80),
  humidity: z.number().max(100).min(1),
  level: z.number().min(0).max(100),
});
