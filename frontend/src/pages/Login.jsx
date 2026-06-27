import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  {
    label: "Demo Workspace",
    email: "demo@intern.space",
    password: "password123",
  },
  {
    label: "Alex's Account",
    email: "alex@intern.space",
    password: "password123",
  },
];

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("Use a demo account or your own credentials to log in.");
  const { login } = useAuth();
  const navigate = useNavigate();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setInfo(name === "email" ? "Make sure your email is valid and ready for secure access." : "Enter your password to continue.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please double-check your credentials.");
      setInfo("Need help? Use a demo account below or register for a new workspace.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setFormData({ email: account.email, password: account.password });
    setInfo(`Using ${account.label}. Logging in now...`);
    setError("");
    setLoading(true);

    try {
      await login({ email: account.email, password: account.password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Demo login failed.");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[90vh] max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid w-full gap-8 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xl sm:p-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-2xl text-white font-black shadow-lg shadow-indigo-200">
            C
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight text-slate-900">{greeting}, welcome back.</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Log in to access your collaborative workspace, manage tasks in real time, and keep your team aligned.
          </p>
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 border border-slate-200 shadow-sm">
            <p className="font-semibold text-slate-900">Quick start</p>
            <p>{info}</p>
          </div>
        </div>

        <form className="space-y-4 rounded-2xl bg-slate-50/70 p-6 border border-slate-200/60" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
            <input
              required
              type="email"
              name="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <p className="mt-2 text-xs text-slate-500">
              {formData.email ? "Looks good — ready to log in." : "Enter your email address to get started."}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
            <input
              required
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <p className="mt-2 text-xs text-slate-500">
              {formData.password ? "Password entered. Ready to sign in." : "Your password keeps your workspace secure."}
            </p>
          </div>

          {error && <p className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 border border-rose-200">{error}</p>}

          <button
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Demo access</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDemoLogin(account)}
                  className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                  disabled={loading}
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>

          <p className="pt-2 text-center text-xs font-semibold text-slate-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Register now
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
