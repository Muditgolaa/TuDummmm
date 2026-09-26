import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { interviewApi } from "../api/client";

export default function NewSession() {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { session } = await interviewApi.post("/api/sessions", { jobTitle, company, jobDescription });
      await interviewApi.post(`/api/sessions/${session._id}/generate`); // Groq, ~2-3s
      navigate(`/interviews/${session._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center px-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-10 text-center max-w-md">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--amber)]" />
          <h2 className="mt-6 font-display text-xl font-bold text-[var(--text)]">Generating your questions…</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            The AI is crafting 8 role-specific questions. This takes a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-8">
      <div className="w-full max-w-xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
        <h1 className="font-display text-2xl font-extrabold text-[var(--text)]">New interview session</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Paste a job description and we'll generate tailored questions.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required maxLength={120}
            placeholder="Job title (e.g. Backend Developer)"
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]" />
          <input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={120}
            placeholder="Company (optional)"
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]" />
          <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required maxLength={5000}
            placeholder="Paste the job description here…"
            className="w-full min-h-40 resize-y bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]" />

          {error && <p className="text-sm" style={{ color: "var(--amber-2)" }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => navigate("/interviews")}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold border border-[var(--border-strong)] text-[var(--text)] hover:border-[var(--amber)]">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg py-2.5 text-sm font-bold"
              style={{ background: "linear-gradient(180deg,var(--amber),var(--amber-2))", color: "#1a0f02" }}>
              Generate questions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}