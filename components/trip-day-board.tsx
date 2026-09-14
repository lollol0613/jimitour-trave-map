"use client";

import {
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId } from "react";

interface TripDayBoardProps {
  children: React.ReactNode;
  onDragEnd?: (activeId: string, overId: string | null) => void;
}

interface DroppableDayProps {
  dayId: string;
  itemIds: string[];
  children: React.ReactNode;
}

export function DroppableDay({ dayId, itemIds, children }: DroppableDayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dayId,
  });

  return (
    <div
      ref={setNodeRef}
      className={isOver ? "rounded-xl ring-2 ring-blue-400" : "rounded-xl"}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}

interface SortablePlaceProps {
  id: string;
  children: React.ReactNode;
}

export function SortablePlace({ id, children }: SortablePlaceProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
}

export default function TripDayBoard({
  children,
  onDragEnd,
}: TripDayBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const dndId = useId();

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      onDragEnd={(event) => {
        const activeId = String(event.active.id);
        const overId = event.over ? String(event.over.id) : null;

        onDragEnd?.(activeId, overId);
      }}
    >
      {children}
    </DndContext>
  );
}
