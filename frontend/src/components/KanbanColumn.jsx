import { Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

function KanbanColumn({ columnId, title, tasks, members, onEdit, onDelete }) {
  return (
    <section className="flex h-full min-h-[420px] w-full flex-col rounded-2xl border border-slate-200 bg-slate-50">
      <header className="border-b border-slate-200 p-3">
        <h3 className="font-display text-lg font-bold text-slate-800">
          {title} <span className="text-sm text-slate-500">({tasks.length})</span>
        </h3>
      </header>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-3 p-3 transition ${
              snapshot.isDraggingOver ? "bg-indigo-50" : ""
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
