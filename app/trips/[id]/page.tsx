import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

interface TripPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function addDay(tripId: string) {
  "use server";

  const { data: existingDays, error: readError } = await supabase
    .from("trip_days")
    .select("day_number")
    .eq("trip_id", tripId)
    .order("day_number", { ascending: false })
    .limit(1);

  if (readError) {
    throw new Error(readError.message);
  }

  const nextDayNumber =
    existingDays && existingDays.length > 0
      ? existingDays[0].day_number + 1
      : 1;

  const { error: insertError } = await supabase.from("trip_days").insert({
    trip_id: tripId,
    day_number: nextDayNumber,
    title: `Day ${nextDayNumber}`,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath(`/trips/${tripId}`);
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, name, start_date, end_date, memo")
    .eq("id", id)
    .single();

  const { data: days, error: daysError } = await supabase
    .from("trip_days")
    .select("id, day_number, title")
    .eq("trip_id", id)
    .order("day_number", { ascending: true });

  const { data: tripPlaces, error: tripPlacesError } = await supabase
    .from("trip_places")
    .select(
      `
    id,
    trip_day_id,
    position,
    places (
      id,
      name,
      category,
      city,
      rating
    )
  `,
    )
    .order("position", { ascending: true });

  if (error || !trip) {
    notFound();
  }

  if (daysError) {
    throw new Error(daysError.message);
  }

  if (tripPlacesError) {
    throw new Error(tripPlacesError.message);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 여행 지도로 돌아가기
        </Link>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-blue-600">여행 일정</p>

          <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>

          <div className="mt-6 space-y-3 text-sm text-zinc-700">
            <p>
              <strong className="font-medium text-zinc-950">시작일:</strong>{" "}
              {trip.start_date ?? "미정"}
            </p>

            <p>
              <strong className="font-medium text-zinc-950">종료일:</strong>{" "}
              {trip.end_date ?? "미정"}
            </p>

            <p>
              <strong className="font-medium text-zinc-950">메모:</strong>{" "}
              {trip.memo ?? "메모 없음"}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">일정</h2>

            <form action={addDay.bind(null, trip.id)}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                + Day 추가
              </button>
            </form>
          </div>

          {days && days.length > 0 ? (
            <div className="space-y-3">
              {days.map((day) => {
                const placesForDay =
                  tripPlaces?.filter((item) => item.trip_day_id === day.id) ??
                  [];

                return (
                  <div
                    key={day.id}
                    className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold">
                        {day.title ?? `Day ${day.day_number}`}
                      </h3>

                      <Link
                        href={`/trips/${trip.id}/days/${day.id}/add-place`}
                        className="shrink-0 inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                      >
                        + 장소 추가
                      </Link>
                    </div>

                    {placesForDay.length > 0 ? (
                      <ol className="mt-4 space-y-3">
                        {placesForDay.map((item) => {
                          const place = Array.isArray(item.places)
                            ? item.places[0]
                            : item.places;

                          if (!place) {
                            return null;
                          }

                          return (
                            <li
                              key={item.id}
                              className="rounded-lg bg-zinc-50 p-3"
                            >
                              <span className="mr-2 font-medium">
                                {item.position}.
                              </span>

                              {place.name}
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <p className="mt-4 text-sm text-zinc-500">
                        아직 추가된 장소가 없습니다.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">아직 일정이 없습니다.</p>
          )}
        </div>
      </section>
    </main>
  );
}
