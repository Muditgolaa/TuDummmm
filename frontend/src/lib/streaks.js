// Pure functions that turn a `logs` map into streaks, activity and heatmap levels. `logs` shape: { "YYYY-MM-DD": { done: {habitId: bool}, minutes: number, note: string } }

import { ymd, parseYmd, addDays } from "./dates";

export function doneCount(logs, ds) {
  const l = logs[ds];
  if (!l || !l.done) return 0;
  return Object.values(l.done).filter(Boolean).length;
}

export function isActive(logs, ds) {
  const l = logs[ds];
  return doneCount(logs, ds) >= 1 || (l && l.minutes > 0);
}

// Consecutive active days ending today — or yesterday, so an unfinished
// today doesn't read as a broken streak.
export function currentStreak(logs) {
  let cur = new Date();
  if (!isActive(logs, ymd(cur))) cur = addDays(cur, -1);
  let s = 0;
  while (isActive(logs, ymd(cur))) {
    s++;
    cur = addDays(cur, -1);
  }
  return s;
}

export function longestStreak(logs) {
  const keys = Object.keys(logs);
  if (!keys.length) return 0;
  keys.sort();
  const start = parseYmd(keys[0]);
  const end = new Date();
  let run = 0;
  let best = 0;
  for (let d = start; ymd(d) <= ymd(end); d = addDays(d, 1)) {
    if (isActive(logs, ymd(d))) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

export function habitStreak(logs, id) {
  const done = (ds) => {
    const l = logs[ds];
    return !!(l && l.done && l.done[id]);
  };
  let cur = new Date();
  if (!done(ymd(cur))) cur = addDays(cur, -1);
  let s = 0;
  while (done(ymd(cur))) {
    s++;
    cur = addDays(cur, -1);
  }
  return s;
}

// Heatmap intensity 0–4, from the share of habits finished that day.
export function level(logs, ds, habitCount) {
  const c = doneCount(logs, ds);
  if (c <= 0) return 0;
  const t = Math.max(1, habitCount);
  const r = c / t;
  if (r >= 1) return 4;
  if (r >= 0.66) return 3;
  if (r >= 0.34) return 2;
  return 1;
}

export function weekSummary(logs) {
  let activeDays = 0;
  let minutes = 0;
  for (let i = 0; i < 7; i++) {
    const ds = ymd(addDays(new Date(), -i));
    if (isActive(logs, ds)) activeDays++;
    const l = logs[ds];
    if (l) minutes += l.minutes || 0;
  }
  return { activeDays, minutes };
}

export function totalActiveDays(logs) {
  return Object.keys(logs).filter((k) => isActive(logs, k)).length;
}