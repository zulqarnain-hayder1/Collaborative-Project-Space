import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProjectBoard from "../components/ProjectBoard";
import MilestoneTracker from "../components/MilestoneTracker";
import TaskStatsWidget from "../components/TaskStatsWidget";
import InviteMemberModal from "../components/InviteMemberModal";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadProject = async () => {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data.project);
      setTasks(data.tasks);
    };

    loadProject().catch(console.error);
  }, [id]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    socket.emit("join-project", id);

    const onTaskCreated = (task) => {
      setTasks((prev) => [task, ...prev.filter((existing) => existing._id !== task._id)]);
      const msg = `⚡ Task created: ${task.title}`;
      setNotifications((prev) => [{ type: "info", message: msg }, ...prev].slice(0, 6));
      showToast(msg, "info");
    };

    const onTaskUpdated = (task) => {
      setTasks((prev) => prev.map((existing) => (existing._id === task._id ? task : existing)));
      const msg = `⚡ Task updated: ${task.title}`;
      setNotifications((prev) => [{ type: "info", message: msg }, ...prev].slice(0, 6));
      showToast(msg, "info");
    };

    const onTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      const msg = "⚡ Task removed from board";
      setNotifications((prev) => [{ type: "info", message: msg }, ...prev].slice(0, 6));
      showToast(msg, "info");
    };

    const onTaskMoved = ({ taskId, status }) => {
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? { ...task, status } : task))
      );
      const msg = `⚡ Task moved to ${status}`;
      setNotifications((prev) => [{ type: "info", message: msg }, ...prev].slice(0, 6));
      showToast(msg, "info");
    };

    const onCollaborationUsers = (payload) => {
      setCollaborators((prev) => {
        if (payload.action === "joined") {
          if (prev.some((collab) => collab.userId === payload.userId)) return prev;
          showToast(`👋 ${payload.name} joined the project!`, "success");
          return [...prev, payload];
        }
        return prev.filter((collab) => collab.userId !== payload.userId);
      });
    };

    socket.on("task-created", onTaskCreated);
    socket.on("task-updated", onTaskUpdated);
    socket.on("task-moved", onTaskMoved);
    socket.on("task-deleted", onTaskDeleted);
    socket.on("collaboration-users", onCollaborationUsers);

    return () => {
      socket.emit("leave-project", id);
      socket.off("task-created", onTaskCreated);
      socket.off("task-updated", onTaskUpdated);
      socket.off("task-moved", onTaskMoved);
      socket.off("task-deleted", onTaskDeleted);
      socket.off("collaboration-users", onCollaborationUsers);
      disconnectSocket();
    };
  }, [id]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const searchMatch = `${task.title} ${task.description || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

        const assigneeMatch =
          !assigneeFilter ||
          task.assignedTo?._id === assigneeFilter ||
          task.assignedTo === assigneeFilter;

        return searchMatch && assigneeMatch;
      }),
    [tasks, search, assigneeFilter]
  );

  const updateMilestoneProgress = async (index, progress) => {
    if (!project) return;

    const nextMilestones = project.milestones.map((milestone, milestoneIndex) =>
      milestoneIndex === index
        ? {
            ...milestone,
            progress,
            isCompleted: progress >= 100,
          }
        : milestone
    );

    const previousProject = project;
    setProject((prev) => ({ ...prev, milestones: nextMilestones }));

    try {
      const { data } = await api.put(`/projects/${id}/milestones`, { milestones: nextMilestones });
      setProject(data);
      showToast("Milestones updated", "success");
    } catch {
      setProject(previousProject);
      setNotifications((prev) => [{ type: "error", message: "Milestone update failed" }, ...prev].slice(0, 6));
    }
  };

  if (!project) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          Loading project workspace...
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="animate-pop fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-xs font-bold text-white shadow-2xl border border-slate-700">
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <header className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-gradient-to-bl from-indigo-100/60 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/dashboard" className="text-xs font-bold text-indigo-600 hover:underline">← Back to Projects</Link>
            </div>
            <h1 className="font-display text-3xl font-black text-slate-900 sm:text-4xl">{project.name}</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">{project.description || "No description provided."}</p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-md shadow-slate-200"
            >
              + Invite Members
            </button>
          </div>
        </div>

        {/* Team Avatars & Collaborators */}
        <div className="mt-6 flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Team Members:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {project.members.map((member) => (
                <span key={member._id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  {member.name}
                </span>
              ))}
            </div>
          </div>

          {/* Active online indicator */}
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 border border-emerald-200/60">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-800">
              {collaborators.length > 0 ? `${collaborators.length} Online Collaborators` : "Live Sync Active"}
            </span>
          </div>
        </div>
      </header>

      {/* Control Filters */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Search Tasks</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or tag..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Filter by Assignee</label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Team Members ({project.members.length})</option>
              {project.members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Board & Sidebar Grid */}
      <section className="grid gap-8 xl:grid-cols-4">
        <div className="xl:col-span-3 space-y-6">
          <ProjectBoard
            projectId={id}
            members={project.members}
            tasks={filteredTasks}
            setTasks={setTasks}
            setNotifications={setNotifications}
          />
        </div>

        <div className="space-y-6">
          <TaskStatsWidget tasks={tasks} />

          <MilestoneTracker milestones={project.milestones} />

          {/* Milestone Sliders */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-slate-800">Adjust Milestones</h3>
            <p className="mt-1 text-xs text-slate-500">Update progress sliders to reflect project goals</p>
            <div className="mt-4 space-y-4">
              {project.milestones.length === 0 && <p className="text-xs text-slate-400 italic">No milestones to update.</p>}
              {project.milestones.map((milestone, index) => (
                <div key={milestone._id || milestone.title}>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>{milestone.title}</span>
                    <span className="text-indigo-600">{milestone.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={milestone.progress}
                    onChange={(e) => updateMilestoneProgress(index, Number(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Live Notifications Drawer */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-slate-800">Live Workspace Activity</h3>
            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
              {notifications.length === 0 && (
                <p className="text-xs text-slate-400 italic">Listening for real-time events...</p>
              )}
              {notifications.map((note, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl px-3.5 py-2 text-xs font-semibold ${
                    note.type === "error"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-indigo-50/70 text-indigo-800 border border-indigo-100"
                  }`}
                >
                  {note.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <InviteMemberModal
          projectId={id}
          existingMembers={project.members}
          onClose={() => setInviteModalOpen(false)}
          onMemberAdded={(updatedProject) => {
            setProject(updatedProject);
            setInviteModalOpen(false);
            showToast("Member added to project", "success");
          }}
        />
      )}
    </main>
  );
}

export default ProjectDetails;
