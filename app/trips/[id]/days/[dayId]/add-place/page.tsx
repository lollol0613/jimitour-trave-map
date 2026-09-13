import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { getRatingLabel } from "@/lib/rating";
import type { Place } from "@/types/place";

interface AddPlacePageProps {
  params: Promise<{
    id: string;
    dayId: string;
  }>;
}

type PlaceListItem = Pick<
  Place,
  "id" | "name" | "category" | "city" | "rating"
>;

async function addPlaceToDay(tripId: string, dayId: string, placeId: string) {
  "use server";

  const { data: lastItem, error: readError } = await supabase
    .from("trip_places")
    .select("position")
    .eq("trip_day_id", dayId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  const nextPosition = lastItem ? lastItem.position + 1 : 1;

  const { error: insertError } = await supabase.from("trip_places").insert({
    trip_day_id: dayId,
    place_id: placeId,
    position: nextPosition,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }
}

function getCategoryLabel(category: Place["category"]) {
  switch (category) {
    case "accommodation":
      return "🏨 숙박";
    case "restaurant":
      return "🍴 맛집";
    case "attraction":
      return "📍 가볼 곳";
    case "cafe":
      return "☕ 카페";
    case "shopping":
      return "🛍 쇼핑";
    default:
      return "📌 기타";
  }
}

export default async function AddPlacePage({ params }: AddPlacePageProps) {
  const { id, dayId } = await params;

  const { data: day, error: dayError } = await supabase
    .from("trip_days")
    .select("id, trip_id, day_number, title")
    .eq("id", dayId)
    .eq("trip_id", id)
    .single();

  if (dayError || !day) {
    notFound();
  }

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, name, city")
    .eq("id", id)
    .single();

  if (tripError || !trip) {
    notFound();
  }

  let placesQuery = supabase
    .from("places")
    .select("id, name, category, city, rating")
    .order("name", { ascending: true });

  if (trip.city) {
    placesQuery = placesQuery.eq("city", trip.city);
  }

  const { data: places, error: placesError } =
    await placesQuery.returns<PlaceListItem[]>();

  if (placesError) {
    throw new Error(placesError.message);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl">
        <Link
          href={`/trips/${id}`}
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 여행 일정으로 돌아가기
        </Link>

        <p className="mb-2 text-sm font-medium text-blue-600">
          {day.title ?? `Day ${day.day_number}`}
        </p>

        <h1 className="mb-8 text-3xl font-bold tracking-tight">장소 추가</h1>

        {!places || places.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-5 text-zinc-600">
            등록된 장소가 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {places.map((place) => (
              <li
                key={place.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <h2 className="font-semibold">{place.name}</h2>

                <p className="mt-1 text-sm text-zinc-600">
                  {getCategoryLabel(place.category)}
                  {place.city ? ` · ${place.city}` : ""}
                  {` · ${getRatingLabel(place.rating)}`}
                </p>
                <form
                  action={addPlaceToDay.bind(null, id, dayId, place.id)}
                  className="mt-3"
                >
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    이 Day에 추가
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
