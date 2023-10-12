import dayjs, { Dayjs } from "dayjs";

const roundMinutesToCandleUnix = (time: Dayjs, round: "up" | "down", minutes: number): number =>
  time
    .set("minutes", Math.floor(time.minute() / minutes) * minutes + (round === "up" ? minutes : 0))
    .set("seconds", 0)
    .unix();

const roundHoursToCandleUnix = (time: Dayjs, round: "up" | "down", hours: number): number =>
  time
    .set("hours", Math.floor(time.hour() / hours) * hours + (round === "up" ? hours : 0))
    .set("minutes", 0)
    .set("seconds", 0)
    .unix();

const roundDaysToCandleUnix = (time: Dayjs, round: "up" | "down", date: number): number =>
  time
    .set("date", Math.floor(time.date() / date) * date + (round === "up" ? date : 0))
    .set("hours", 0)
    .set("minutes", 0)
    .set("seconds", 0)
    .unix();

const roundWeekToCandleUnix = (time: any, round: "up" | "down"): number =>
  time
    .set("day", round === "up" ? 8 : 1)
    .set("hours", 0)
    .set("minutes", 0)
    .set("seconds", 0)
    .unix();

const roundMonthsToCandleUnix = (time: Dayjs, round: "up" | "down"): number =>
  time
    .set("month", time.month() + (round === "up" ? 1 : 0))
    .set("date", 1)
    .set("hours", 0)
    .set("minutes", 0)
    .set("seconds", 0)
    .unix();

const map: Record<string, (time: Dayjs, round: "up" | "down") => number> = {
  "1": (time: Dayjs, round: "up" | "down") => roundMinutesToCandleUnix(time, round, 1),
  "3": (time: Dayjs, round: "up" | "down") => roundMinutesToCandleUnix(time, round, 3),
  "5": (time: Dayjs, round: "up" | "down") => roundMinutesToCandleUnix(time, round, 5),
  "15": (time: Dayjs, round: "up" | "down") => roundMinutesToCandleUnix(time, round, 15),
  "30": (time: Dayjs, round: "up" | "down") => roundMinutesToCandleUnix(time, round, 30),
  "60": (time: Dayjs, round: "up" | "down") => roundHoursToCandleUnix(time, round, 1),
  "120": (time: Dayjs, round: "up" | "down") => roundHoursToCandleUnix(time, round, 2), // 2 * 60 * 60,
  "240": (time: Dayjs, round: "up" | "down") => roundHoursToCandleUnix(time, round, 4), // 4 * 60 * 60,
  "360": (time: Dayjs, round: "up" | "down") => roundHoursToCandleUnix(time, round, 6), // 6 * 60 * 60,
  "480": (time: Dayjs, round: "up" | "down") => roundHoursToCandleUnix(time, round, 8), // 8 * 60 * 60,
  "720": (time: Dayjs, round: "up" | "down") => roundHoursToCandleUnix(time, round, 12), // 12 * 60 * 60,
  D: (time: Dayjs, round: "up" | "down") => roundDaysToCandleUnix(time, round, 1), // 24 * 60 * 60,
  "1D": (time: Dayjs, round: "up" | "down") => roundDaysToCandleUnix(time, round, 1), // 24 * 60 * 60,
  "3D": (time: Dayjs, round: "up" | "down") => roundDaysToCandleUnix(time, round, 3), // 3 * 24 * 60 * 60,
  W: (time: Dayjs, round: "up" | "down") => roundWeekToCandleUnix(time, round), // 7 * 24 * 60 * 60,
  "1W": (time: Dayjs, round: "up" | "down") => roundWeekToCandleUnix(time, round), // 7 * 24 * 60 * 60,
  M: (time: Dayjs, round: "up" | "down") => roundMonthsToCandleUnix(time, round), // 30 * 24 * 60 * 60,
  "1M": (time: Dayjs, round: "up" | "down") => roundMonthsToCandleUnix(time, round), // 30 * 24 * 60 * 60,
};

export const roundDateToCandleUnix = (date: Dayjs, round: "up" | "down", period: string) => {
  const func = map[period];
  if (func == null) throw new Error(`Invalid period: ${period}`);
  return func(date, round);
};

export const roundUnixToCandleUnix = (unix: number, round: "up" | "down", period: string) => {
  const date = dayjs(unix * 1000);
  const func = map[period];
  if (func == null) throw new Error(`Invalid period: ${period}`);
  return func(date, round);
};
