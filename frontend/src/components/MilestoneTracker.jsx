function MilestoneTracker({ milestones = [] }) {
  const completedCount = milestones.filter((m) => m.progress >= 100 || m.isCompleted).length;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-slate-800">Project Milestones</h3>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700">
          {completedCount}/{milestones.length} Done
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {milestones.length === 0 && (
          <p className="text-xs text-slate-400 italic">No milestones configured for this project.</p>
        )}

        {milestones.map((milestone) => {
          const isDone = milestone.progress >= 100 || milestone.isCompleted;
          return (
            <div key={milestone._id || milestone.title} className="group">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className={`font-bold ${isDone ? "text-emerald-700" : "text-slate-700"}`}>
                  {isDone ? "✓ " : ""}{milestone.title}
                </span>
                <span className={`font-extrabold ${isDone ? "text-emerald-600" : "text-indigo-600"}`}>
                  {milestone.progress}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDone
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs"
                      : "bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-500"
                  }`}
                  style={{ width: `${milestone.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MilestoneTracker;
