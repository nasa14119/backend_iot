import { dayEnd, dayStart } from "@formkit/tempo";
import { and, gte, lte } from "drizzle-orm";

export const SELECT_MONTH = (column: any) => {
  const now = new Date();
  const todayStart = dayStart(now);
  const todayEnd = dayEnd(now);
  return and(gte(column, todayStart), lte(column, todayEnd));
};
export const round_two = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;
