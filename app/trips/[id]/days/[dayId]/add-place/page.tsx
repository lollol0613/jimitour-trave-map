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

type CandidatePlace = {
  id: string;
  name: string;
  category: Place["category"];
  city: string | null;
  rating: number | null;
  latitude: number;
  longitude: number;
};

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

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
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

  const { data: existingTripPlaces, error: existingTripPlacesError } =
    await supabase
      .from("trip_places")
      .select(
        `
      place_id,
      trip_days!inner (
        trip_id
      ),
      places (
        id,
        latitude,
        longitude
      )
    `,
      )
      .eq("trip_days.trip_id", id);

  if (existingTripPlacesError) {
    throw new Error(existingTripPlacesError.message);
  }

  const existingPlaceIds = new Set(
    (existingTripPlaces ?? []).map((item) => item.place_id),
  );

  const existingCoordinates = (existingTripPlaces ?? [])
    .map((item) => {
      const place = Array.isArray(item.places) ? item.places[0] : item.places;

      if (
        !place ||
        !Number.isFinite(place.latitude) ||
        !Number.isFinite(place.longitude)
      ) {
        return null;
      }

      return {
        latitude: place.latitude,
        longitude: place.longitude,
      };
    })
    .filter(
      (
        coordinate,
      ): coordinate is {
        latitude: number;
        longitude: number;
      } => coordinate !== null,
    );

  const center =
    existingCoordinates.length > 0
      ? {
          latitude:
            existingCoordinates.reduce(
              (sum, place) => sum + place.latitude,
              0,
            ) / existingCoordinates.length,
          longitude:
            existingCoordinates.reduce(
              (sum, place) => sum + place.longitude,
              0,
            ) / existingCoordinates.length,
        }
      : null;

  let placesQuery = supabase
    .from("places")
    .select("id, name, category, city, rating, latitude, longitude")
    .order("name", { ascending: true })
    .returns<CandidatePlace[]>();

  const { data: places, error: placesError } = await placesQuery;

  if (placesError) {
    throw new Error(placesError.message);
  }

  const nearbyPlaces = (places ?? [])
    .filter((place) => !existingPlaceIds.has(place.id))
    .map((place) => {
      const distanceKm = center
        ? getDistanceKm(
            center.latitude,
            center.longitude,
            place.latitude,
            place.longitude,
          )
        : null;

      return {
        ...place,
        distanceKm,
      };
    })
    .filter((place) => {
      if (!center) {
        return true;
      }

      return place.distanceKm !== null && place.distanceKm <= 80;
    })
    .sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;

      return a.distanceKm - b.distanceKm;
    });

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
            {nearbyPlaces.map((place) => (
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
