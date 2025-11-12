import z from "zod";
export type RegistreType = {
  temperature: number;
  humidity: number;
  [key: `sensor_${number}`]: boolean;
};
export const Registre = z
  .object({
    temperature: z.number().max(80),
    humidity: z.number().max(100).min(1),
    sensors: z.boolean().array().min(1, { error: "Array was empty" }),
  })
  .transform(({ sensors, ...rest }) => {
    const result: RegistreType = { ...rest };
    sensors.forEach((v, i) => {
      result[`sensor_${++i}`] = v;
    });
    return result;
  });
