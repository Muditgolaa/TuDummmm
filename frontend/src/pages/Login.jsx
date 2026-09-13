import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7">
        <h1 className="font-display text-3xl font-extrabold text-[var(--text)]">TuDummmm</h1>
        <p className="text-sm text-[var(--muted)] mt-1 mb-6">Log in to track your streaks and practice interviews.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]" />
          {error && <p className="text-sm" style={{ color: "var(--amber-2)" }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm font-bold disabled:opacity-50"
            style={{ background: "linear-gradient(180deg,var(--amber),var(--amber-2))", color: "#1a0f02" }}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--border)]" /><span className="text-xs text-[var(--faint)]">or</span><div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (cr) => { try { await loginWithGoogle(cr.credential); navigate("/dashboard"); } catch (err) { setError(err.message); } }}
            onError={() => setError("Google sign-in failed")}
          />
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          No account? <Link to="/register" className="font-semibold text-[var(--amber)] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}