"use client";

"use client";

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "@/lib/supabase";
import TripRouteMap from "@/components/trip-route-map";

import TripDayBoard, {
  DroppableDay,
  SortablePlace,
} from "@/components/trip-day-board";

type ItineraryPlace = {
  id: string;
  tripDayId: string;
  position: number;
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
};

type ItineraryDay = {
  id: string;
  dayNumber: number;
  title: string | null;
};

interface TripItineraryBoardProps {
  days: ItineraryDay[];
  places: ItineraryPlace[];
}

async function saveOrder(updatedItems: ItineraryPlace[]) {
  const updates = updatedItems.map((item) => ({
    id: item.id,
    tripDayId: item.tripDayId,
    position: item.position,
  }));

  const { error } = await supabase.rpc("reorder_trip_places", {
    p_updates: updates,
  });

  if (error) {
    console.error("Failed to save trip order:", error);
  }
}

export default function TripItineraryBoard({
  days,
  places,
}: TripItineraryBoardProps) {
  const [items, setItems] = useState(places);
  return (
    <TripDayBoard
      onDragEnd={(activeId, overId) => {
        if (!overId) {
          return;
        }

        setItems((currentItems) => {
          const activeItem = currentItems.find((item) => item.id === activeId);

          if (!activeItem) {
            return currentItems;
          }

          const overItem = currentItems.find((item) => item.id === overId);

          const overDay = days.find((day) => day.id === overId);

          const targetDayId = overItem
            ? overItem.tripDayId
            : overDay
              ? overDay.id
              : null;

          if (!targetDayId) {
            return currentItems;
          }

          const sourceDayId = activeItem.tripDayId;

          if (sourceDayId === targetDayId) {
            if (!overItem || activeId === overId) {
              return currentItems;
            }

            const dayItems = currentItems
              .filter((item) => item.tripDayId === sourceDayId)
              .sort((a, b) => a.position - b.position);

            const oldIndex = dayItems.findIndex((item) => item.id === activeId);

            const newIndex = dayItems.findIndex((item) => item.id === overId);

            const reorderedDayItems = arrayMove(
              dayItems,
              oldIndex,
              newIndex,
            ).map((item, index) => ({
              ...item,
              position: index + 1,
            }));

            const newItems = currentItems.map((item) => {
              const updatedItem = reorderedDayItems.find(
                (reordered) => reordered.id === item.id,
              );

              return updatedItem ?? item;
            });

            saveOrder(newItems);

            return newItems;
          }

          const sourceItems = currentItems
            .filter(
              (item) => item.tripDayId === sourceDayId && item.id !== activeId,
            )
            .sort((a, b) => a.position - b.position)
            .map((item, index) => ({
              ...item,
              position: index + 1,
            }));

          const targetItems = currentItems
            .filter((item) => item.tripDayId === targetDayId)
            .sort((a, b) => a.position - b.position);

          const movedItem = {
            ...activeItem,
            tripDayId: targetDayId,
          };

          if (overItem) {
            const targetIndex = targetItems.findIndex(
              (item) => item.id === overId,
            );

            targetItems.splice(targetIndex, 0, movedItem);
          } else {
            targetItems.push(movedItem);
          }

          const reorderedTargetItems = targetItems.map((item, index) => ({
            ...item,
            position: index + 1,
          }));

          const untouchedItems = currentItems.filter(
            (item) =>
              item.tripDayId !== sourceDayId && item.tripDayId !== targetDayId,
          );

          const newItems = [
            ...untouchedItems,
            ...sourceItems,
            ...reorderedTargetItems,
          ];

          saveOrder(newItems);

          return newItems;
        });
      }}
    >
      <div className="space-y-3">
        {days.map((day) => {
          const placesForDay = items
            .filter((place) => place.tripDayId === day.id)
            .sort((a, b) => a.position - b.position);

          return (
            <DroppableDay
              key={day.id}
              dayId={day.id}
              itemIds={placesForDay.map((place) => place.id)}
            >
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">
                  {day.title ?? `Day ${day.dayNumber}`}
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  {placesForDay.length}개 장소
                </p>

                {placesForDay.length > 0 && (
                  <>
                    <ol className="mt-3 space-y-2">
                      {placesForDay.map((place) => (
                        <SortablePlace key={place.id} id={place.id}>
                          <li className="rounded-lg bg-zinc-50 p-3">
                            <span className="mr-2 font-medium">
                              {place.position}.
                            </span>

                            {place.name}
                          </li>
                        </SortablePlace>
                      ))}
                    </ol>

                    <div className="mt-5">
                      <TripRouteMap
                        places={placesForDay.map((place) => ({
                          id: place.placeId,
                          name: place.name,
                          latitude: place.latitude,
                          longitude: place.longitude,
                          position: place.position,
                        }))}
                      />
                    </div>
                  </>
                )}
              </div>
            </DroppableDay>
          );
        })}
      </div>
    </TripDayBoard>
  );
}
