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
        .filter((task) => task.deadline && task.status !== "Completed")
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 6),
    [tasks]
  );

  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const criticalTasks = tasks.filter((task) => task.priority === "Critical" && task.status !== "Completed").length;
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          Loading dashboard metrics...
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="rounded-full bg-indigo-500/30 px-3.5 py-1 text-xs font-bold text-indigo-200 border border-indigo-400/30">
            Workspace Intelligence
          </span>
          <h1 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">
            Collaborative Overview
          </h1>
          <p className="mt-2 text-sm text-indigo-200 leading-relaxed">
            Track performance, project progress, and critical upcoming deadlines across all your team environments.
          </p>
        </div>
      </section>

      {/* Metrics Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Projects</p>
            <p className="mt-2 text-3xl font-black text-slate-800">{projects.length}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600 font-bold">
            📁
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Tasks</p>
            <p className="mt-2 text-3xl font-black text-slate-800">{tasks.length}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600 font-bold">
            ⚡
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Completion Rate</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">{progress}%</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600 font-bold">
            🎯
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Critical Issues</p>
            <p className="mt-2 text-3xl font-black text-rose-600">{criticalTasks}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-600 font-bold">
            🔥
          </div>
        </article>
      </section>

      {/* Main Grid: My Projects & Upcoming Deadlines */}
      <section className="grid gap-8 lg:grid-cols-3">
        <article className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">Active Projects</h2>
              <p className="text-xs text-slate-500">Your collaborative team workspaces</p>
            </div>
            <Link
              to="/projects/new"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition"
            >
              + Create Project
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {projects.length === 0 && (
              <p className="col-span-2 text-center py-8 text-sm text-slate-500">No projects yet. Create one to get started!</p>
            )}
            {projects.map((project) => (
              <div
                key={project._id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-xs transition hover:border-indigo-300 hover:bg-white hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {project.name}
                    </h3>
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {project.members?.length || 0} members
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-3">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/projects/${project._id}`}
                    className="rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 shadow-2xs hover:bg-indigo-600 hover:text-white transition"
                  >
                    Open Space →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Upcoming Deadlines Sidebar */}
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Upcoming Deadlines</h2>
          <p className="text-xs text-slate-500">Tasks requiring imminent completion</p>

          <div className="mt-6 space-y-3">
            {upcomingDeadlines.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-400 italic">No upcoming deadlines scheduled.</p>
            )}
            {upcomingDeadlines.map((task) => {
              const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft <= 2;
              return (
                <div key={task._id} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-xs text-slate-800">{task.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        isUrgent ? "bg-rose-100 text-rose-700" : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Priority: <strong className="text-slate-700">{task.priority}</strong></span>
                    <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
