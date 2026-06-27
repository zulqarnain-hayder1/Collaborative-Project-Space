import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
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
          <h1 className="font-display text-4xl font-black tracking-tight text-slate-900">Create Workspace Account</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Join intern team spaces, assign tasks, collaborate on real-time Kanban boards, and build together.
          </p>
        </div>

        <form className="space-y-4 rounded-2xl bg-slate-50/70 p-6 border border-slate-200/60" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
            <input
              required
              name="name"
              placeholder="Alex Morgan"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
            <input
              required
              type="email"
              name="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
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
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {error && <p className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 border border-rose-200">{error}</p>}

          <button
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register & Enter →"}
          </button>
          
          <p className="pt-2 text-center text-xs font-semibold text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Register;
