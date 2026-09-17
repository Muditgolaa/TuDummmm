import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(`/api/sessions/${id}/report`);

  if (loading) return <Centered>Loading report…</Centered>;
  if (error) return <Centered>Error: {error}</Centered>;

  const { session, items, stats } = data;
  const chip = "font-mono-nums text-xs px-3 py-1 rounded-full border border-[var(--border)] text-[var(--muted)]";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-[var(--text)]">Session report</h1>
        <button onClick={() => navigate("/interviews")}
          className="rounded-lg px-5 py-2 text-sm font-semibold border border-[var(--border-strong)] text-[var(--text)] hover:border-[var(--amber)]">
          Interviews
        </button>
      </div>

      {/* summary */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold text-[var(--text)]">{session.jobTitle}</p>
          {session.company && <p className="text-sm text-[var(--muted)]">{session.company}</p>}
          <span className={`${chip} inline-block mt-2`}>{session.status}</span>
        </div>
        <div className="text-center">
          <p className="text-sm text-[var(--muted)]">Average score</p>
          <p className="font-display font-extrabold text-5xl" style={{ color: "var(--amber)" }}>
            {stats.avgScore ?? "—"}{stats.avgScore != null && <span className="text-2xl text-[var(--muted)]">/100</span>}
          </p>
          <p className="text-sm text-[var(--muted)]">{stats.answered} of {stats.total} answered</p>
        </div>
      </div>

      {/* per-question breakdown */}
      <div className="mt-6 space-y-3">
        {items.map(({ question, answer }, i) => (
          <div key={question._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <span className={chip}>{question.category}</span>
                <span className={chip}>{question.difficulty}</span>
              </div>
              {answer ? (
                <span className="font-display font-bold text-2xl" style={{ color: "var(--amber)" }}>
                  {answer.score}<span className="text-sm text-[var(--muted)]">/100</span>
                </span>
              ) : (
                <span className="text-sm text-[var(--muted)]">Not answered</span>
              )}
            </div>
            <p className="mt-3 font-medium text-[var(--text)]">{i + 1}. {question.content}</p>
            {answer && (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--faint)]">Your answer</p>
                  <p className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 mt-1 text-sm text-[var(--text)]">{answer.content}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--faint)]">Feedback</p>
                  <p className="mt-1 text-sm text-[var(--text)]">{answer.feedback}</p>
                </div>
                <p className="text-xs text-[var(--faint)] font-mono-nums">⏱ {answer.timeSpentSeconds}s</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Centered({ children }) {
  return <div className="grid min-h-[60vh] place-items-center text-[var(--muted)]">{children}</div>;
}