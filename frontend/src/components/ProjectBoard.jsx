import { useMemo, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import api from "../services/api";
import KanbanColumn from "./KanbanColumn";

const columns = ["To Do", "In Progress", "Review", "Completed"];

const emptyTaskForm = {
  title: "",
  description: "",
  assignedTo: "",
  deadline: "",
  priority: "Medium",
  status: "To Do",
};

function ProjectBoard({ projectId, members, tasks, setTasks, setNotifications }) {
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const groupedTasks = useMemo(() => {
    const bucket = {
      "To Do": [],
      "In Progress": [],
      Review: [],
      Completed: [],
    };

    tasks.forEach((task) => {
      bucket[task.status]?.push(task);
    });

    return bucket;
  }, [tasks]);

  const handleDragEnd = async (result) => {
    const { destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const nextStatus = destination.droppableId;
    const currentTask = tasks.find((task) => task._id === draggableId);

    if (!currentTask || currentTask.status === nextStatus) {
      return;
    }

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
      setNotifications((prev) => [{ type: "error", message: "Failed to move task" }, ...prev].slice(0, 5));
    }
  };

  const clearForm = () => {
    setTaskForm(emptyTaskForm);
    setEditingTaskId(null);
  };

  const onTaskFormChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...taskForm,
      projectId,
      assignedTo: taskForm.assignedTo || null,
      deadline: taskForm.deadline || null,
    };

    try {
      if (editingTaskId) {
        const { data } = await api.put(`/tasks/${editingTaskId}`, payload);
        setTasks((prev) => prev.map((task) => (task._id === editingTaskId ? data : task)));
        setNotifications((prev) => [{ type: "success", message: "Task updated" }, ...prev].slice(0, 5));
      } else {
        const { data } = await api.post("/tasks", payload);
        setTasks((prev) => [data, ...prev]);
        setNotifications((prev) => [{ type: "success", message: "Task created" }, ...prev].slice(0, 5));
      }

      clearForm();
    } catch {
      setNotifications((prev) => [{ type: "error", message: "Task action failed" }, ...prev].slice(0, 5));
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : "",
      priority: task.priority,
      status: task.status,
    });
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch {
      setNotifications((prev) => [{ type: "error", message: "Failed to delete task" }, ...prev].slice(0, 5));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleTaskSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-display text-xl font-bold text-slate-800">
          {editingTaskId ? "Edit Task" : "Create Task"}
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            required
            name="title"
            value={taskForm.title}
            onChange={onTaskFormChange}
            placeholder="Task title"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <select
            name="assignedTo"
            value={taskForm.assignedTo}
            onChange={onTaskFormChange}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            value={taskForm.description}
            onChange={onTaskFormChange}
            placeholder="Task description"
            className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
          />
          <input
            type="date"
            name="deadline"
            value={taskForm.deadline}
            onChange={onTaskFormChange}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <select
            name="priority"
            value={taskForm.priority}
            onChange={onTaskFormChange}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <select
            name="status"
            value={taskForm.status}
            onChange={onTaskFormChange}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            {columns.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">
            {editingTaskId ? "Save Task" : "Add Task"}
          </button>
          {editingTaskId && (
            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 lg:grid-cols-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column}
              columnId={column}
              title={column}
              tasks={groupedTasks[column]}
              members={members}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default ProjectBoard;
