import { useSyncExternalStore } from "react";
import { v4 as uuidv4 } from "uuid";
import { today } from "./dates";
import { api } from "../api/client";

// The tracker's data lives in MongoDB behind the API. This store keeps an
// in-memory mirror in the exact shape the UI expects, hydrates it on login, and
// writes through optimistically (update UI now, reconcile with the server,
// roll back on failure).

// habits: [{ id, name, color }]
// logs:   { "YYYY-MM-DD": { done: { [habitId]: true }, minutes, note } }
// todos:  [{ id, todo, isCompleted }]
let state = { habits: [], logs: {}, todos: [], isDemo: false, loading: true };

const listeners = new Set();
function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); }
function setState(next) { state = next; for (const l of listeners) l(); }

export function useStore() {
  return useSyncExternalStore(subscribe, () => state);
}

// Monotonic "load generation". A hydration only applies if it's still the latest
// thing that happened. Any newer load — or any user write (touch) — supersedes an
// in-flight fetch, so a slow/duplicate GET can never overwrite fresher state.
let loadSeq = 0;
function touch() { loadSeq++; }

// ---------- API <-> UI shape adapters ----------
const habitFromApi = (h) => ({ id: h._id, name: h.name, color: h.color });
const todoFromApi = (t) => ({ id: t._id, todo: t.todo, isCompleted: t.isCompleted });

function logsFromApi(arr) {
  const map = {};
  for (const l of arr) {
    const done = {};
    for (const hid of l.completedHabits || []) done[String(hid)] = true;
    map[l.date] = { done, minutes: l.minutes || 0, note: l.note || "" };
  }
  return map;
}

// Fresh, mutation-safe copy of today's log (new refs for React).
function withTodayLog(logs) {
  const t = today();
  const src = logs[t];
  const log = {
    done: { ...(src?.done || {}) },
    minutes: src?.minutes || 0,
    note: src?.note || "",
  };
  return { logs: { ...logs, [t]: log }, log, t };
}

const completedArray = (log) => Object.keys(log.done).filter((id) => log.done[id]);

// ---------- called by App's Layout when auth changes ----------
export async function attachUser(user) {
  const seq = ++loadSeq; // claim this generation
  if (!user) {
    setState({ habits: [], logs: {}, todos: [], isDemo: false, loading: false });
    return;
  }
  setState({ ...state, loading: true });
  try {
    const [h, l, t] = await Promise.all([
      api.get("/api/habits"),
      api.get("/api/logs"),
      api.get("/api/todos"),
    ]);
    if (seq !== loadSeq) return; // a newer load or a user write happened — don't clobber
    setState({
      habits: (h.habits || []).map(habitFromApi),
      logs: logsFromApi(l.logs || []),
      todos: (t.todos || []).map(todoFromApi),
      isDemo: false,
      loading: false,
    });
  } catch (err) { console.error(err);
    if (seq !== loadSeq) return;
    setState({ habits: [], logs: {}, todos: [], isDemo: false, loading: false });
  }
}

// ---------- actions (optimistic + reconcile) ----------
let noteTimer = null;

export const actions = {
  async addHabit(name) {
    const clean = name.trim();
    if (!clean) return;
    touch();
    const prev = state;
    const tempId = uuidv4();
    setState({ ...state, habits: [...state.habits, { id: tempId, name: clean, color: "var(--border-strong)" }] });
    try {
      const { habit } = await api.post("/api/habits", { name: clean });
      setState({ ...state, habits: state.habits.map((h) => (h.id === tempId ? habitFromApi(habit) : h)) });
    } catch (err) { console.error(err);
      setState(prev);
    }
  },

  async removeHabit(id) {
    touch();
    const prev = state;
    const logs = {};
    for (const [d, l] of Object.entries(state.logs)) {
      const { [id]: removed, ...rest } = l.done || {};
      void removed;
      logs[d] = { ...l, done: rest };
    }
    setState({ ...state, habits: state.habits.filter((h) => h.id !== id), logs });
    try {
      await api.del(`/api/habits/${id}`);
    } catch (err) { console.error(err);
      setState(prev);
    }
  },

  async toggleHabit(id) {
    touch();
    const prev = state;
    const { logs, log, t } = withTodayLog(state.logs);
    log.done[id] = !log.done[id];
    setState({ ...state, logs });
    try {
      await api.put(`/api/logs/${t}`, { completedHabits: completedArray(log) });
    } catch (err) { console.error(err);
      setState(prev);
    }
  },

  async addMinutes(n) {
    touch();
    const prev = state;
    const { logs, log, t } = withTodayLog(state.logs);
    log.minutes = n === 0 ? 0 : (log.minutes || 0) + n;
    setState({ ...state, logs });
    try {
      await api.put(`/api/logs/${t}`, { minutes: log.minutes });
    } catch (err) { console.error(err);
      setState(prev);
    }
  },

  setNote(text) {
    touch();
    const { logs, log, t } = withTodayLog(state.logs);
    log.note = text;
    setState({ ...state, logs });
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      api.put(`/api/logs/${t}`, { note: text }).catch(() => {});
    }, 600);
  },

  startFresh() {},

  async addTodo(text) {
    const clean = text.trim();
    if (!clean) return;
    touch();
    const prev = state;
    const tempId = uuidv4();
    setState({ ...state, todos: [...state.todos, { id: tempId, todo: clean, isCompleted: false }] });
    try {
      const { todo } = await api.post("/api/todos", { todo: clean });
      setState({ ...state, todos: state.todos.map((x) => (x.id === tempId ? todoFromApi(todo) : x)) });
    } catch (err) { console.error(err);
      setState(prev);
    }
  },

  async toggleTodo(id) {
    touch();
    const prev = state;
    const target = state.todos.find((x) => x.id === id);
    if (!target) return;
    const next = !target.isCompleted;
    setState({ ...state, todos: state.todos.map((x) => (x.id === id ? { ...x, isCompleted: next } : x)) });
    try {
      await api.patch(`/api/todos/${id}`, { isCompleted: next });
    } catch (err) { console.error(err);
      setState(prev);
    }
  },

  async updateTodo(id, text) {
    const clean = text.trim();
    if (!clean) return;
    touch();
    const prev = state;
    setState({ ...state, todos: state.todos.map((x) => (x.id === id ? { ...x, todo: clean } : x)) });
    try {
      await api.patch(`/api/todos/${id}`, { todo: clean });
    } catch (err) { console.error(err);
      setState(prev);
    }
  },

  async deleteTodo(id) {
    touch();
    const prev = state;
    setState({ ...state, todos: state.todos.filter((x) => x.id !== id) });
    try {
      await api.del(`/api/todos/${id}`);
    } catch (err) { console.error(err);
      setState(prev);
    }
  },
};