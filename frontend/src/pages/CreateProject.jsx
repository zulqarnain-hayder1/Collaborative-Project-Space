import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const defaultMilestone = { title: "", progress: 0 };

function CreateProject() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberEmails: "",
    milestones: [defaultMilestone],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMilestoneChange = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, milestoneIndex) =>
        milestoneIndex === index ? { ...milestone, [key]: value } : milestone
      ),
    }));
  };

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, defaultMilestone],
    }));
  };

  const removeMilestone = (index) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        memberEmails: formData.memberEmails
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean),
        milestones: formData.milestones.filter((milestone) => milestone.title.trim()),
      };

      const { data } = await api.post("/projects", payload);
      navigate(`/projects/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xl">
        <div className="border-b border-slate-100 pb-5">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            Project Setup
          </span>
          <h1 className="mt-2 font-display text-3xl font-black text-slate-900">Create Project Space</h1>
          <p className="mt-1 text-xs text-slate-500">Establish a collaborative workspace for your intern team</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Project Name
            </label>
            <input
              required
              name="name"
              placeholder="e.g., Summer Intern Kanban Portal"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              name="description"
              placeholder="Describe the goals, technology scope, or objectives..."
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Team Member Emails (Comma Separated)
            </label>
            <input
              name="memberEmails"
              placeholder="alex@example.com, sara@example.com"
              value={formData.memberEmails}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">You can also invite members anytime later from the project details view.</p>
          </div>

          {/* Milestones Config */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-800">Initial Milestones</h2>
                <p className="text-[11px] text-slate-500">Set key project deliverables and target completion percentages</p>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition"
              >
                + Add Milestone
              </button>
            </div>

            <div className="space-y-3">
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <input
                    placeholder="Milestone title (e.g., MVP Release)"
                    value={milestone.title}
                    onChange={(e) => handleMilestoneChange(index, "title", e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5 w-28">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={milestone.progress}
                      onChange={(e) => handleMilestoneChange(index, "progress", Number(e.target.value))}
                      className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-center focus:border-indigo-500 focus:outline-none font-bold"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                  {formData.milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="text-slate-400 hover:text-rose-600 font-bold text-sm px-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 border border-rose-200">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating Space..." : "Launch Project Space →"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateProject;
