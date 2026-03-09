const priorityClassMap = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Critical: "bg-rose-50 text-rose-700 border-rose-200",
};

function TaskCard({ task, members, onEdit, onDelete }) {
  const assignedName = members.find((member) => member._id === task.assignedTo?._id || member._id === task.assignedTo)?.name;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="font-semibold text-slate-800">{task.title}</h4>
        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${priorityClassMap[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <p className="mb-3 line-clamp-3 text-sm text-slate-600">{task.description || "No description"}</p>

      <div className="space-y-1 text-xs text-slate-500">
        <p>Assigned: {assignedName || "Unassigned"}</p>
        <p>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task._id)}
          className="rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
