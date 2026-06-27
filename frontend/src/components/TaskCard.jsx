const priorityClassMap = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  Medium: "bg-amber-50 text-amber-700 border-amber-200/80",
  High: "bg-orange-50 text-orange-700 border-orange-200/80",
  Critical: "bg-rose-50 text-rose-700 border-rose-200/80",
};

function TaskCard({ task, members, onEdit }) {
  const assignedMember = members.find(
    (m) => m._id === task.assignedTo?._id || m._id === task.assignedTo
  ) || task.assignedTo;

  const assignedName = assignedMember?.name;
  const initials = assignedName
    ? assignedName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const subtaskProgress = totalSubtasks ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const commentCount = task.comments?.length || 0;

  return (
    <article
      onClick={() => onEdit(task)}
      className="group relative cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition">
          {task.title}
        </h4>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${priorityClassMap[task.priority] || priorityClassMap.Medium}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs text-slate-500 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks progress */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
            <span>Subtasks</span>
            <span>{completedSubtasks}/{totalSubtasks} ({subtaskProgress}%)</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          {assignedName ? (
            <div className="flex items-center gap-1.5" title={`Assigned to ${assignedName}`}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-[10px] font-bold text-white shadow-xs">
                {initials}
              </div>
              <span className="font-semibold text-slate-700 truncate max-w-[90px]">{assignedName}</span>
            </div>
          ) : (
            <span className="italic text-slate-400">Unassigned</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {commentCount > 0 && (
            <span className="flex items-center gap-1 font-semibold text-slate-600" title={`${commentCount} comments`}>
              💬 {commentCount}
            </span>
          )}
          {task.deadline && (
            <span className="font-medium text-slate-500" title="Deadline">
              📅 {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default TaskCard;
