import { Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

const columnAccentMap = {
  "To Do": "border-blue-500 text-blue-700 bg-blue-50",
  "In Progress": "border-amber-500 text-amber-700 bg-amber-50",
  Review: "border-purple-500 text-purple-700 bg-purple-50",
  Completed: "border-emerald-500 text-emerald-700 bg-emerald-50",
};

function KanbanColumn({ columnId, title, tasks = [], members, onEdit, onDelete, onQuickAdd }) {
  const accentClass = columnAccentMap[title] || "border-indigo-500 text-indigo-700 bg-indigo-50";

  return (
    <section className="flex h-full min-h-[500px] w-full flex-col rounded-3xl border border-slate-200/90 bg-slate-50/70 backdrop-blur-md shadow-xs">
      <header className="flex items-center justify-between border-b border-slate-200/80 p-4">
        <div className="flex items-center gap-2.5">
          <span className={`h-3 w-3 rounded-full border-2 ${accentClass.split(" ")[0]}`} />
          <h3 className="font-display text-base font-bold text-slate-800">
            {title}
          </h3>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${accentClass.split(" ")[1]} ${accentClass.split(" ")[2]}`}>
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onQuickAdd(title)}
          className="flex h-7 w-7 items-center justify-center rounded-xl bg-white font-bold text-slate-600 shadow-xs hover:bg-indigo-600 hover:text-white transition"
          title={`Add task to ${title}`}
        >
          +
        </button>
      </header>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-3.5 p-3.5 transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-indigo-50/60 rounded-b-3xl" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <TaskCard task={task} members={members} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}

export default KanbanColumn;
