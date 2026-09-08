import { connection } from "next/server";
import Link from "next/link";

import TravelMap from "@/components/travel-map";
import { supabase } from "@/lib/supabase";
import type { Place } from "@/types/place";

import { getRatingLabel } from "@/lib/rating";
import PlaceBrowser from "@/components/place-browser";

type PlaceListItem = Pick<
  Place,
  | "id"
  | "name"
  | "category"
  | "status"
  | "latitude"
  | "longitude"
  | "address"
  | "city"
  | "rating"
  | "memo"
>;

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

export default async function Home() {
  await connection();

  const { data: places, error } = await supabase
    .from("places")
    .select(
      "id, name, category, status, latitude, longitude, address, city, rating, memo",
    )
    .returns<PlaceListItem[]>();

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-600">Jimitour</p>
            <h1 className="text-3xl font-bold tracking-tight">
              New Zealand 여행 지도
            </h1>
          </div>

          <Link
            href="/places/new"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            + 장소 추가
          </Link>
        </header>

        <section aria-labelledby="map-heading" className="mb-12">
          <h2 id="map-heading" className="mb-4 text-xl font-semibold">
            지도
          </h2>
          <PlaceBrowser places={places ?? []} />
        </section>
      </section>
    </main>
  );
}
