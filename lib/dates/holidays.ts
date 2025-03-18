import { allForYear } from "@18f/us-federal-holidays";

export const holidays = allForYear(new Date().getFullYear()).map((holiday) => ({
  date: holiday.date,
  name: holiday.name,
}));
