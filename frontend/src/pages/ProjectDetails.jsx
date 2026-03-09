import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProjectBoard from "../components/ProjectBoard";
import MilestoneTracker from "../components/MilestoneTracker";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [collaborators, setCollaborators] = useState([]);

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
    if (!socket) {
      return undefined;
    }

    socket.emit("join-project", id);

    const onTaskCreated = (task) => {
      setTasks((prev) => [task, ...prev.filter((existing) => existing._id !== task._id)]);
      setNotifications((prev) => [{ type: "info", message: `Task created: ${task.title}` }, ...prev].slice(0, 5));
    };

    const onTaskUpdated = (task) => {
      setTasks((prev) => prev.map((existing) => (existing._id === task._id ? task : existing)));
      setNotifications((prev) => [{ type: "info", message: `Task updated: ${task.title}` }, ...prev].slice(0, 5));
    };

    const onTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      setNotifications((prev) => [{ type: "info", message: "Task deleted" }, ...prev].slice(0, 5));
    };

    const onTaskMoved = ({ taskId, status }) => {
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? { ...task, status } : task))
      );
      setNotifications((prev) => [{ type: "info", message: `Task moved to ${status}` }, ...prev].slice(0, 5));
    };

    const onCollaborationUsers = (payload) => {
      setCollaborators((prev) => {
        if (payload.action === "joined") {
          if (prev.some((collab) => collab.userId === payload.userId)) {
            return prev;
          }
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
        const searchMatch = `${task.title} ${task.description}`
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
    if (!project) {
      return;
    }

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
    } catch {
      setProject(previousProject);
      setNotifications((prev) => [{ type: "error", message: "Milestone update failed" }, ...prev].slice(0, 5));
    }
  };

  if (!project) {
    return <p className="p-6">Loading project...</p>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="font-display text-3xl font-black text-slate-800">{project.name}</h1>
        <p className="mt-2 text-slate-600">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {project.members.map((member) => (
            <span key={member._id} className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
              {member.name}
            </span>
          ))}
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-slate-800">Task Filters</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <select
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">All members</option>
              {project.members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-800">Live Collaborators</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {collaborators.length === 0 && <li>No active collaborators yet.</li>}
            {collaborators.map((collab) => (
              <li key={collab.userId} className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">
                {collab.name} is online
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ProjectBoard
            projectId={id}
            members={project.members}
            tasks={filteredTasks}
            setTasks={setTasks}
            setNotifications={setNotifications}
          />
        </div>

        <div className="space-y-4">
          <MilestoneTracker milestones={project.milestones} />
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-800">Update Milestones</h3>
            <div className="mt-3 space-y-3">
              {project.milestones.map((milestone, index) => (
                <label key={milestone._id || milestone.title} className="block text-sm text-slate-700">
                  {milestone.title}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={milestone.progress}
                    onChange={(event) => updateMilestoneProgress(index, Number(event.target.value))}
                    className="mt-1 w-full"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-display text-xl font-bold text-slate-800">Notifications</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {notifications.length === 0 && <li className="text-slate-500">No notifications yet.</li>}
          {notifications.map((note, index) => (
            <li
              key={`${note.message}-${index}`}
              className={`rounded-lg px-3 py-2 ${
                note.type === "error" ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-700"
              }`}
            >
              {note.message}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default ProjectDetails;
