import { useMemo, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import api from "../services/api";
import KanbanColumn from "./KanbanColumn";
import TaskModal from "./TaskModal";

const columns = ["To Do", "In Progress", "Review", "Completed"];

function ProjectBoard({ projectId, members, tasks, setTasks, setNotifications }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("To Do");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");

  // Extract unique tags from all tasks
  const availableTags = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => t.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const priorityMatch = priorityFilter === "All" || t.priority === priorityFilter;
      const tagMatch = selectedTag === "All" || t.tags?.includes(selectedTag);
      return priorityMatch && tagMatch;
    });
  }, [tasks, priorityFilter, selectedTag]);

  const groupedTasks = useMemo(() => {
    const bucket = {
      "To Do": [],
      "In Progress": [],
      Review: [],
      Completed: [],
    };

    filteredTasks.forEach((task) => {
      bucket[task.status]?.push(task);
    });

    return bucket;
  }, [filteredTasks]);

  const handleDragEnd = async (result) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const nextStatus = destination.droppableId;
    const currentTask = tasks.find((task) => task._id === draggableId);

    if (!currentTask || currentTask.status === nextStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((task) => (task._id === draggableId ? { ...task, status: nextStatus } : task))
    );

    try {
      const { data } = await api.put(`/tasks/${draggableId}`, { status: nextStatus });
      setTasks((prev) => prev.map((task) => (task._id === draggableId ? data : task)));
    } catch {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === draggableId ? { ...task, status: currentTask.status } : task
        )
      );
      setNotifications((prev) => [{ type: "error", message: "Failed to update task position" }, ...prev].slice(0, 5));
    }
  };

  const handleOpenCreateModal = (status = "To Do") => {
    setActiveTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setActiveTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = (savedTask, isSilent = false) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t._id === savedTask._id);
      if (exists) {
        return prev.map((t) => (t._id === savedTask._id ? savedTask : t));
      }
      return [savedTask, ...prev];
    });

    if (!isSilent) {
      setNotifications((prev) => [
        { type: "success", message: activeTask ? "Task updated" : "Task created successfully" },
        ...prev,
      ].slice(0, 5));
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      setNotifications((prev) => [{ type: "info", message: "Task deleted" }, ...prev].slice(0, 5));
    } catch {
      setNotifications((prev) => [{ type: "error", message: "Failed to delete task" }, ...prev].slice(0, 5));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header & Filters */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-800">Kanban Workspace</h2>
            <p className="text-xs text-slate-500">Drag and drop cards across stages or click to view details</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
              {["All", "Low", "Medium", "High", "Critical"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`rounded-xl px-2.5 py-1 font-bold transition ${
                    priorityFilter === p
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleOpenCreateModal("To Do")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-700 hover:to-blue-700 transition"
            >
              <span className="text-base">+</span> New Task
            </button>
          </div>
        </div>

        {/* Dynamic Tag Filter Pills */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
            <span className="text-[11px] font-extrabold uppercase text-slate-400">Tags:</span>
            <button
              onClick={() => setSelectedTag("All")}
              className={`rounded-full px-3 py-0.5 text-xs font-bold transition ${
                selectedTag === "All"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Tags
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full px-3 py-0.5 text-xs font-bold transition ${
                  selectedTag === tag
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Kanban Columns Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2 grid-cols-1">
          {columns.map((column) => (
            <KanbanColumn
              key={column}
              columnId={column}
              title={column}
              tasks={groupedTasks[column]}
              members={members}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onQuickAdd={handleOpenCreateModal}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={activeTask}
          defaultStatus={defaultStatus}
          projectId={projectId}
          members={members}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}

export default ProjectBoard;
