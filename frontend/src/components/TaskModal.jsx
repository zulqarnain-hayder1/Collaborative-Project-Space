import { useState, useEffect } from "react";
import api from "../services/api";

const priorityOptions = ["Low", "Medium", "High", "Critical"];
const statusOptions = ["To Do", "In Progress", "Review", "Completed"];

function TaskModal({ task, defaultStatus = "To Do", projectId, members, onClose, onSave, onDelete }) {
  const isEditing = Boolean(task?._id);

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo?._id || task?.assignedTo || "");
  const [status, setStatus] = useState(task?.status || defaultStatus);
  const [priority, setPriority] = useState(task?.priority || "Medium");
  const [deadline, setDeadline] = useState(
    task?.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : ""
  );

  const [tags, setTags] = useState(task?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [subtaskInput, setSubtaskInput] = useState("");

  const [comments, setComments] = useState(task?.comments || []);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssignedTo(task.assignedTo?._id || task.assignedTo || "");
      setStatus(task.status || defaultStatus);
      setPriority(task.priority || "Medium");
      setDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : "");
      setTags(task.tags || []);
      setSubtasks(task.subtasks || []);
      setComments(task.comments || []);
    }
  }, [task, defaultStatus]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);


  const handleAddTag = (e) => {
    if ((e.key === "Enter" || e.type === "click") && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = (e) => {
    if ((e.key === "Enter" || e.type === "click") && subtaskInput.trim()) {
      e.preventDefault();
      setSubtasks([...subtasks, { title: subtaskInput.trim(), isCompleted: false }]);
      setSubtaskInput("");
    }
  };

  const handleToggleSubtask = (index) => {
    setSubtasks(
      subtasks.map((st, i) => (i === index ? { ...st, isCompleted: !st.isCompleted } : st))
    );
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !isEditing) return;

    setLoadingComment(true);
    try {
      const { data } = await api.post(`/tasks/${task._id}/comments`, { text: commentInput });
      setComments(data.comments || []);
      setCommentInput("");
      onSave(data, true); // update task silently
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      description,
      assignedTo: assignedTo || null,
      status,
      priority,
      deadline: deadline || null,
      projectId,
      tags,
      subtasks,
    };

    try {
      if (isEditing) {
        const { data } = await api.put(`/tasks/${task._id}`, payload);
        onSave(data);
      } else {
        const { data } = await api.post("/tasks", payload);
        onSave(data);
      }
      onClose();
    } catch (err) {
      console.error("Task save error", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="animate-pop relative my-8 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
        >
          ✕
        </button>

        <h2 className="font-display text-2xl font-black text-slate-800">
          {isEditing ? "Task Details & Discussion" : "Create New Task"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Task Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Implement OAuth Authentication"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Assignee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add comprehensive notes, requirements, or links..."
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tags / Labels</label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-rose-600 font-bold">×</button>
                </span>
              ))}
              <div className="flex gap-1">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag and press enter..."
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Subtasks Checklist Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="font-display text-sm font-bold text-slate-800">
              Subtasks & Checklist ({subtasks.filter((s) => s.isCompleted).length}/{subtasks.length})
            </h3>
            <div className="mt-3 space-y-2">
              {subtasks.map((st, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => handleToggleSubtask(i)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={st.isCompleted ? "line-through text-slate-400" : ""}>{st.title}</span>
                  </label>
                  <button type="button" onClick={() => handleRemoveSubtask(i)} className="text-slate-400 hover:text-rose-500 text-xs font-bold">
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <input
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={handleAddSubtask}
                  placeholder="Add a new checklist item..."
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Discussion / Comments Thread */}
          {isEditing && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="font-display text-sm font-bold text-slate-800">Activity & Comments ({comments.length})</h3>
              <div className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
                {comments.length === 0 && <p className="text-xs text-slate-500 italic">No comments yet. Start the discussion below.</p>}
                {comments.map((c, idx) => (
                  <div key={idx} className="rounded-xl bg-white p-3 shadow-sm border border-slate-200 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{c.user?.name || "Team Member"}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="mt-1 text-slate-600">{c.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handlePostComment}
                  disabled={loadingComment}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(task._id);
                  onClose();
                }}
                className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
              >
                Delete Task
              </button>
            ) : <div />}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-700 hover:to-blue-700 transition"
              >
                {saving ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
