import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid w-full gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl lg:grid-cols-2">
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-black text-indigo-700">Create your account</h1>
          <p className="text-slate-600">Start collaborating with your intern team in minutes.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            required
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" type="submit">
            Register
          </button>
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-700">
              Login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Register;
