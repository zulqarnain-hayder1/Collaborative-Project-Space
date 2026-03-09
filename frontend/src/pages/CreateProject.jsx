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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

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
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-3xl font-black text-slate-800">Create New Project</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            required
            name="name"
            placeholder="Project name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            name="memberEmails"
            placeholder="Team member emails (comma-separated)"
            value={formData.memberEmails}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />

          <div className="space-y-3 rounded-xl border border-slate-200 p-4">
            <h2 className="font-display text-xl font-bold text-slate-800">Milestones</h2>
            {formData.milestones.map((milestone, index) => (
              <div key={`${index}-${milestone.title}`} className="grid gap-3 md:grid-cols-2">
                <input
                  placeholder="Milestone title"
                  value={milestone.title}
                  onChange={(event) => handleMilestoneChange(index, "title", event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={milestone.progress}
                  onChange={(event) => handleMilestoneChange(index, "progress", Number(event.target.value))}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addMilestone}
              className="rounded-lg border border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-700"
            >
              Add milestone
            </button>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">
            Create Project
          </button>
        </form>
      </section>
    </main>
  );
}

export default CreateProject;
