import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";

interface AddEventToTripPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function addEventToDay(eventId: string, tripId: string, dayId: string) {
  "use server";

  const supabase = await createServerSupabaseClient();

  const { data: existingItem, error: existingError } = await supabase
    .from("trip_items")
    .select("id")
    .eq("trip_day_id", dayId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingItem) {
    redirect(`/trips/${tripId}`);
  }

  const { data: lastItem, error: readError } = await supabase
    .from("trip_items")
    .select("position")
    .eq("trip_day_id", dayId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  const nextPosition = lastItem ? lastItem.position + 1 : 1;

  const { error: insertError } = await supabase.from("trip_items").insert({
    trip_day_id: dayId,
    item_type: "event",
    place_id: null,
    event_id: eventId,
    position: nextPosition,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  redirect(`/trips/${tripId}`);
}

export default async function AddEventToTripPage({
  params,
}: AddEventToTripPageProps) {
  const { id } = await params;

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, city, start_date, end_date, event_month")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  const { data: trips, error: tripsError } = await supabase
    .from("trips")
    .select("id, name, start_date, end_date")
    .order("created_at", { ascending: false });

  if (tripsError) {
    throw new Error(tripsError.message);
  }

  const { data: days, error: daysError } = await supabase
    .from("trip_days")
    .select("id, trip_id, day_number, title")
    .order("day_number", { ascending: true });

  if (daysError) {
    throw new Error(daysError.message);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl">
        <Link
          href={`/events/${event.id}`}
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 이벤트로 돌아가기
        </Link>

        <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-blue-600">
            🎆 일정에 이벤트 추가
          </p>

          <h1 className="text-2xl font-bold">{event.name}</h1>

          <p className="mt-2 text-sm text-zinc-600">
            {event.start_date}
            {event.end_date && event.end_date !== event.start_date
              ? ` ~ ${event.end_date}`
              : ""}

            {event.event_month && (
              <span className="ml-2">· 매년 {event.event_month}월</span>
            )}
          </p>
        </div>

        {!trips || trips.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="text-zinc-600">등록된 여행 일정이 없습니다.</p>

            <Link
              href="/trips/new"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + 일정 만들기
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {trips.map((trip) => {
              const tripDays =
                days?.filter((day) => day.trip_id === trip.id) ?? [];

              return (
                <div
                  key={trip.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4">
                    <h2 className="font-semibold">{trip.name}</h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      {trip.start_date ?? "시작일 미정"}
                      {trip.end_date ? ` ~ ${trip.end_date}` : ""}
                    </p>
                  </div>

                  {tripDays.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      아직 Day가 없습니다.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tripDays.map((day) => (
                        <form
                          key={day.id}
                          action={addEventToDay.bind(
                            null,
                            event.id,
                            trip.id,
                            day.id,
                          )}
                        >
                          <button
                            type="submit"
                            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            + {day.title ?? `Day ${day.day_number}`}
                          </button>
                        </form>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
