import { describe, it, expect } from "vitest";
import {
  doneCount, isActive, currentStreak, longestStreak,
  habitStreak, level, weekSummary, totalActiveDays,
} from "./streaks";
import { ymd, addDays } from "./dates";

// Helper: build a logs map keyed by "days ago" for readable tests.
const day = (n) => ymd(addDays(new Date(), -n));
function logs(spec) {
  // spec: { [daysAgo]: { done?: {id:true}, minutes?, note? } }
  const out = {};
  for (const [n, v] of Object.entries(spec)) out[day(Number(n))] = { done: {}, minutes: 0, note: "", ...v };
  return out;
}

describe("doneCount", () => {
  it("counts only truthy habits", () => {
    expect(doneCount(logs({ 0: { done: { a: true, b: false, c: true } } }), day(0))).toBe(2);
  });
  it("is 0 for a missing day", () => {
    expect(doneCount({}, day(0))).toBe(0);
  });
});

describe("isActive", () => {
  it("is active with >=1 habit done", () => {
    expect(isActive(logs({ 0: { done: { a: true } } }), day(0))).toBe(true);
  });
  it("is active with focus minutes but no habits", () => {
    expect(isActive(logs({ 0: { minutes: 25 } }), day(0))).toBe(true);
  });
  it("is inactive with nothing", () => {
    expect(isActive(logs({ 0: {} }), day(0))).toBe(false);
  });
});

describe("currentStreak", () => {
  it("counts consecutive active days ending today", () => {
    expect(currentStreak(logs({ 0: { done: { a: true } }, 1: { done: { a: true } }, 2: { minutes: 10 } }))).toBe(3);
  });
  it("does not break when today is not yet logged (counts through yesterday)", () => {
    expect(currentStreak(logs({ 1: { done: { a: true } }, 2: { done: { a: true } } }))).toBe(2);
  });
  it("is 0 when there is a gap at yesterday and today", () => {
    expect(currentStreak(logs({ 3: { done: { a: true } } }))).toBe(0);
  });
});

describe("habitStreak", () => {
  it("counts consecutive days a specific habit was done", () => {
    expect(habitStreak(logs({ 0: { done: { x: true } }, 1: { done: { x: true } } }), "x")).toBe(2);
  });
  it("ignores days where a different habit was done", () => {
    expect(habitStreak(logs({ 0: { done: { y: true } } }), "x")).toBe(0);
  });
});

describe("level", () => {
  it("is 0 with nothing done", () => {
    expect(level(logs({ 0: {} }), day(0), 4)).toBe(0);
  });
  it("is 4 when all habits done", () => {
    expect(level(logs({ 0: { done: { a: true, b: true, c: true, d: true } } }), day(0), 4)).toBe(4);
  });
});

describe("weekSummary + totalActiveDays", () => {
  it("sums active days and minutes over the last 7 days", () => {
    const l = logs({ 0: { done: { a: true }, minutes: 30 }, 1: { minutes: 15 }, 3: { done: { a: true } } });
    const s = weekSummary(l);
    expect(s.activeDays).toBe(3);
    expect(s.minutes).toBe(45);
  });
  it("totalActiveDays counts every active day", () => {
    expect(totalActiveDays(logs({ 0: { done: { a: true } }, 10: { minutes: 5 }, 11: {} }))).toBe(2);
  });
});

describe("longestStreak", () => {
  it("finds the longest consecutive active run", () => {
    // active: 5,4,3 (run of 3) then gap at 2, then 1,0 (run of 2)
    const l = logs({ 5: { done: { a: true } }, 4: { minutes: 5 }, 3: { done: { a: true } }, 1: { done: { a: true } }, 0: { done: { a: true } } });
    expect(longestStreak(l)).toBe(3);
  });
});