import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { interviewApi } from "../api/client";

// The mock-interview home: analytics tiles + your past sessions.
// Renders inside the app Layout, so no header/logout here (the Navbar handles that).
export default function Interviews() {
  const analytics = useFetch("/api/analytics",interviewApi);
  const sessionsReq = useFetch("/api/sessions",interviewApi);

  const stats = analytics.data;
  const sessions = sessionsReq.data?.sessions || [];

  async function handleDelete(id) {
    if (!confirm("Delete this session? This can't be undone.")) return;
    try {
      await interviewApi.del(`/api/sessions/${id}`);
      sessionsReq.refetch();
      analytics.refetch();
    } catch (err) {
      alert(err.message);
    }
  }

  const tiles = [
    { label: "Avg score", value: stats?.avgScore ?? "—" },
    { label: "Best score", value: stats?.bestScore ?? "—" },
    { label: "Answered", value: stats?.totalAnswered ?? 0 },
    { label: "Completion", value: stats ? `${stats.completionRate}%` : "—" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      {/* heading + CTA */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--text)]">Mock interviews</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Practice AI-scored interviews tailored to any job description.
          </p>
        </div>
        <Link
          to="/interviews/new"
          className="rounded-lg px-5 py-2.5 text-sm font-bold"
          style={{ background: "linear-gradient(180deg,var(--amber),var(--amber-2))", color: "#1a0f02" }}
        >
          + New session
        </Link>
      </section>

      {/* analytics tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="font-display font-bold text-3xl text-[var(--text)] font-mono-nums">{t.value}</div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--faint)] mt-1">{t.label}</div>
          </div>
        ))}
      </section>

      {/* session list */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <h2 className="font-display font-bold text-base text-[var(--text)] mb-3">Your sessions</h2>

        {sessionsReq.loading && <p className="text-sm text-[var(--muted)]">Loading…</p>}
        {sessionsReq.error && <p className="text-sm" style={{ color: "var(--amber-2)" }}>{sessionsReq.error}</p>}

        {!sessionsReq.loading && sessions.length === 0 && (
          <p className="text-sm text-[var(--faint)] py-6 text-center">
            No sessions yet — start your first interview.
          </p>
        )}

        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--text)] truncate">{s.jobTitle}</p>
                <p className="text-xs text-[var(--muted)] truncate">{s.company || "—"}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono-nums text-[11px] px-2 py-0.5 rounded-md border border-[var(--border)] text-[var(--muted)]">
                    {s.status}
                  </span>
                  <span className="text-[11px] text-[var(--faint)] font-mono-nums">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <Link
                  to={s.status === "completed" ? `/interviews/${s._id}/report` : `/interviews/${s._id}`}
                  className="rounded-lg px-4 py-2 text-sm font-semibold border border-[var(--border-strong)] text-[var(--text)] hover:border-[var(--amber)]"
                >
                  {s.status === "completed" ? "Report" : "Open"}
                </Link>
                <button
                  onClick={() => handleDelete(s._id)}
                  title="Delete"
                  className="rounded-lg w-9 h-9 grid place-items-center border border-[var(--border)] text-[var(--faint)] hover:text-[var(--amber-2)] hover:border-[var(--border-strong)]"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}