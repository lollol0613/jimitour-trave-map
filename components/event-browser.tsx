"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdminOnly from "@/components/admin-only";

type EventItem = {
  id: string;
  name: string;
  city: string | null;
  start_date: string;
  end_date: string | null;
  event_month: number | null;
  category: string | null;
  image_url: string | null;
  memo: string | null;
};

type EventBrowserProps = {
  events: EventItem[];
};

export default function EventBrowser({ events }: EventBrowserProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  const filteredEvents = useMemo(() => {
    if (selectedMonth === "all") {
      return events;
    }

    return events.filter((event) => event.event_month === selectedMonth);
  }, [events, selectedMonth]);

  return (
    <div>
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex w-max gap-2">
          <button
            type="button"
            onClick={() => setSelectedMonth("all")}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              selectedMonth === "all"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            전체
          </button>

          {Array.from({ length: 12 }, (_, index) => {
            const month = index + 1;

            return (
              <button
                key={month}
                type="button"
                onClick={() => setSelectedMonth(month)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  selectedMonth === month
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {month}월
              </button>
            );
          })}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-600">
          해당 월에 등록된 이벤트가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="relative rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <AdminOnly>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  <span>✏️</span>
                  <span>Edit</span>
                </Link>
              </AdminOnly>
              <div className="flex gap-4">
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.name}
                    className="h-24 w-24 shrink-0 rounded-lg object-cover"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold">{event.name}</h2>

                  <p className="mt-1 text-sm text-zinc-600">
                    {event.start_date}
                    {event.end_date && event.end_date !== event.start_date
                      ? ` ~ ${event.end_date}`
                      : ""}

                    {event.event_month && (
                      <span className="ml-2 text-zinc-500">
                        · 매년 {event.event_month}월
                      </span>
                    )}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {[event.city, event.category].filter(Boolean).join(" · ")}
                  </p>

                  {event.memo && (
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {event.memo}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
