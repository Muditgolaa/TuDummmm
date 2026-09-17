import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export default function Session() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState({}); // { [questionId]: {score, feedback, content} }
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const speech = useSpeechRecognition();

  // Load questions + any existing answers (so Back + resume work).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.get(`/api/sessions/${id}/report`);
        if (!active) return;
        const qs = data.items.map((it) => it.question);
        const res = {};
        data.items.forEach((it) => {
          if (it.answer) {
            res[it.question._id] = {
              score: it.answer.score,
              feedback: it.answer.feedback,
              content: it.answer.content,
            };
          }
        });
        setQuestions(qs);
        setResults(res);
        const firstUnanswered = qs.findIndex((q) => !res[q._id]);
        setIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const current = questions[index];
  const currentResult = current ? results[current._id] : null;
  const answeredCount = Object.keys(results).length;
  const allDone = questions.length > 0 && answeredCount >= questions.length;

  // Timer only runs on an unanswered question.
  useEffect(() => {
    if (loading || currentResult) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading, currentResult, index]);

  function goToQuestion(nextIndex) {
    if (speech.listening) speech.stop();
    setAnswer("");
    setSeconds(0);
    setIndex(nextIndex);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (speech.listening) speech.stop();
    setSubmitting(true);
    try {
      const res = await api.post(`/api/questions/${current._id}/answers`, {
        content: answer,
        timeSpentSeconds: seconds,
      });
      setResults((prev) => ({
        ...prev,
        [current._id]: { score: res.answer.score, feedback: res.answer.feedback, content: answer },
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMic() {
    if (speech.listening) speech.stop();
    else speech.start((text) => setAnswer((prev) => (prev ? prev + " " : "") + text));
  }

  if (loading) return <Centered>Loading…</Centered>;
  if (error) return <Centered>Error: {error}</Centered>;
  if (!current) return <Centered>No questions found.</Centered>;

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const chip = "font-mono-nums text-xs px-3 py-1 rounded-full border border-[var(--border)] text-[var(--muted)]";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* progress + timer + exit */}
      <div className="flex items-center justify-between gap-3">
        <span className={chip}>Question {index + 1} of {questions.length}</span>
        <div className="flex items-center gap-2">
          {!currentResult && <span className={chip}>⏱ {mins}:{secs}</span>}
          <button type="button"
            onClick={() => { if (confirm("Exit the interview? Answered questions are already saved.")) navigate("/interviews"); }}
            className="rounded-full px-4 py-1.5 text-xs font-semibold border border-[var(--border)] hover:border-[var(--border-strong)]"
            style={{ color: "var(--amber-2)" }}>
            ✕ Exit
          </button>
        </div>
      </div>

      {/* question */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mt-5">
        <div className="flex gap-2">
          <span className={chip}>{current.category}</span>
          <span className={chip}>{current.difficulty}</span>
        </div>
        <p className="mt-4 text-lg text-[var(--text)]">{current.content}</p>
      </div>

      {currentResult ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mt-5">
          <p className="text-center text-sm text-[var(--muted)]">Your score</p>
          <p className="text-center font-display font-extrabold text-5xl" style={{ color: "var(--amber)" }}>
            {currentResult.score}<span className="text-2xl text-[var(--muted)]">/100</span>
          </p>
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 mt-4">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--faint)]">Your answer</p>
            <p className="mt-1 text-sm text-[var(--text)]">{currentResult.content}</p>
          </div>
          <p className="mt-4 text-sm text-[var(--text)]">{currentResult.feedback}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5">
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} required
            placeholder="Type your answer, or tap the mic to speak…"
            className="w-full min-h-48 resize-y bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--amber)]" />
          {speech.listening && speech.interim && (
            <p className="mt-2 text-xs italic text-[var(--muted)]">{speech.interim}</p>
          )}
          <div className="mt-3 flex items-center gap-3">
            {speech.supported && (
              <button type="button" onClick={toggleMic}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold border border-[var(--border-strong)] hover:border-[var(--amber)]"
                style={{ color: speech.listening ? "var(--amber-2)" : "var(--text)" }}>
                {speech.listening ? "⏹ Stop" : "🎤 Speak"}
              </button>
            )}
            <button type="submit" disabled={submitting}
              className="flex-1 rounded-lg py-2.5 text-sm font-bold disabled:opacity-60"
              style={{ background: "linear-gradient(180deg,var(--amber),var(--amber-2))", color: "#1a0f02" }}>
              {submitting ? "Scoring…" : "Submit answer"}
            </button>
          </div>
          {speech.listening && <p className="mt-2 text-center text-xs text-[var(--muted)]">Listening… speak now</p>}
        </form>
      )}

      {/* nav */}
      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => goToQuestion(Math.max(0, index - 1))} disabled={index === 0}
          className="rounded-lg px-5 py-2 text-sm font-semibold border border-[var(--border)] text-[var(--text)] disabled:opacity-40 hover:border-[var(--amber)]">
          ← Back
        </button>
        {index < questions.length - 1 ? (
          <button onClick={() => goToQuestion(Math.min(questions.length - 1, index + 1))}
            className="rounded-lg px-5 py-2 text-sm font-semibold border border-[var(--border)] text-[var(--text)] hover:border-[var(--amber)]">
            Next →
          </button>
        ) : allDone ? (
          <Link to={`/interviews/${id}/report`} className="rounded-lg px-5 py-2 text-sm font-bold"
            style={{ background: "linear-gradient(180deg,var(--amber),var(--amber-2))", color: "#1a0f02" }}>
            View report
          </Link>
        ) : (
          <span className="text-xs text-[var(--muted)]">Answer all to finish</span>
        )}
      </div>

      <div className="mt-6 text-center">
        <button onClick={() => navigate("/interviews")} className="text-sm text-[var(--muted)] hover:underline">
          Save &amp; exit to interviews
        </button>
      </div>
    </div>
  );
}

function Centered({ children }) {
  return <div className="grid min-h-[60vh] place-items-center text-[var(--muted)]">{children}</div>;
}