function MilestoneTracker({ milestones = [] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-display text-xl font-bold text-slate-800">Milestone Progress</h3>
      <div className="mt-4 space-y-4">
        {milestones.length === 0 && <p className="text-sm text-slate-500">No milestones added yet.</p>}

        {milestones.map((milestone) => (
          <div key={milestone._id || milestone.title}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">{milestone.title}</span>
              <span className="font-bold text-indigo-700">{milestone.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all"
                style={{ width: `${milestone.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MilestoneTracker;
