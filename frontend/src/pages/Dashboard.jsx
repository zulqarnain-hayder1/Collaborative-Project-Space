import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: projectData } = await api.get("/projects");
        setProjects(projectData);

        const taskCalls = projectData.map((project) => api.get(`/tasks/${project._id}`));
        const taskResults = await Promise.all(taskCalls);
        setTasks(taskResults.flatMap((result) => result.data));
      } catch (error) {
        console.error("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const upcomingDeadlines = useMemo(
    () =>
      [...tasks]
        .filter((task) => task.deadline)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5),
    [tasks]
  );

  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Projects</p>
          <p className="mt-2 text-3xl font-black text-indigo-700">{projects.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Tasks</p>
          <p className="mt-2 text-3xl font-black text-indigo-700">{tasks.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Overall Progress</p>
          <p className="mt-2 text-3xl font-black text-indigo-700">{progress}%</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-800">My Projects</h2>
          <ul className="mt-4 space-y-3">
            {projects.map((project) => (
              <li key={project._id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-slate-800">{project.name}</p>
                  <p className="text-sm text-slate-500">{project.description || "No description"}</p>
                </div>
                <Link to={`/projects/${project._id}`} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-800">Upcoming Deadlines</h2>
          <ul className="mt-4 space-y-3">
            {upcomingDeadlines.length === 0 && <li className="text-sm text-slate-500">No upcoming deadlines.</li>}
            {upcomingDeadlines.map((task) => (
              <li key={task._id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-slate-800">{task.title}</p>
                <p className="text-sm text-slate-500">{new Date(task.deadline).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
