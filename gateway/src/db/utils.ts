import { dayEnd, dayStart, parse } from "@formkit/tempo";
import { and, gte, lte } from "drizzle-orm";
import z from "zod";
export const check_date_format = (
  date: string
): [null, Date] | [string, null] => {
  const { data: day, error } = z
    .string()
    .regex(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/,
      "Date must be in the format DD/MM/YY"
    )
    .safeParse(date);
  if (error) {
    return [error.message, null];
  }
  return [null, parse(day, "DD/MM/YY")];
};
export const SELECT_DAY = (column: any) => {
  const now = new Date();
  const todayStart = dayStart(now);
  const todayEnd = dayEnd(now);
  return and(gte(column, todayStart), lte(column, todayEnd));
};
export const SELECT_UNTIL_DAY = (day: Date, column: any) => {
  const day_end = dayEnd(day);
  return lte(column, day_end);
};
export const SELECT_DATE = (date: string, column: any) => {
  const [error, day] = check_date_format(date);
  if (error !== null) throw new Error(error);
  const todayStart = dayStart(day);
  const todayEnd = dayEnd(day);
  return and(gte(column, todayStart), lte(column, todayEnd));
};
export const round_two = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const endDayParse = (
  date: string
): [error: null, date: Date] | [error: string, date: null] => {
  try {
    z.string()
      .regex(
        /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/,
        "Date must be in the format DD/MM/YY"
      )
      .parse(date);
    const parse_date = parse(date, "DD/MM/YY");
    return [null, dayEnd(parse_date)];
  } catch (error) {
    return ["Something wen't wrong with parsing date", null];
  }
};
