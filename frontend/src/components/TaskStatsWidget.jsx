function TaskStatsWidget({ tasks = [] }) {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "To Do").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const review = tasks.filter((t) => t.status === "Review").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;

  const getPct = (count) => (total ? Math.round((count / total) * 100) : 0);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-bold text-slate-800">Board Health & Stats</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
          {total} Total Tasks
        </span>
      </div>

      {/* Segmented multi-color progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex p-0.5 mb-5">
        <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${getPct(todo)}%` }} title={`To Do: ${todo}`} />
        <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${getPct(inProgress)}%` }} title={`In Progress: ${inProgress}`} />
        <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${getPct(review)}%` }} title={`Review: ${review}`} />
        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${getPct(completed)}%` }} title={`Completed: ${completed}`} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center justify-between rounded-xl bg-blue-50/60 p-2.5 border border-blue-100">
          <span className="font-bold text-blue-700">To Do</span>
          <span className="font-extrabold text-blue-900">{todo} ({getPct(todo)}%)</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-amber-50/60 p-2.5 border border-amber-100">
          <span className="font-bold text-amber-700">In Progress</span>
          <span className="font-extrabold text-amber-900">{inProgress} ({getPct(inProgress)}%)</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-purple-50/60 p-2.5 border border-purple-100">
          <span className="font-bold text-purple-700">Review</span>
          <span className="font-extrabold text-purple-900">{review} ({getPct(review)}%)</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 p-2.5 border border-emerald-100">
          <span className="font-bold text-emerald-700">Completed</span>
          <span className="font-extrabold text-emerald-900">{completed} ({getPct(completed)}%)</span>
        </div>
      </div>
    </div>
  );
}

export default TaskStatsWidget;
