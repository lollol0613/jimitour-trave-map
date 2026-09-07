import { connection } from "next/server";
import Link from "next/link";

import TravelMap from "@/components/travel-map";
import { supabase } from "@/lib/supabase";
import type { Place } from "@/types/place";

type PlaceListItem = Pick<
  Place,
  | "id"
  | "name"
  | "category"
  | "status"
  | "latitude"
  | "longitude"
  | "address"
  | "rating"
  | "memo"
>;

export default async function Home() {
  await connection();

  const { data: places, error } = await supabase
    .from("places")
    .select(
      "id, name, category, status, latitude, longitude, address, rating, memo",
    )
    .returns<PlaceListItem[]>();

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-600">Jimitour</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Auckland 여행 지도
          </h1>
        </header>

        <section aria-labelledby="map-heading" className="mb-12">
          <h2 id="map-heading" className="mb-4 text-xl font-semibold">
            지도
          </h2>
          <TravelMap places={places ?? []} />
        </section>

        <h2 className="mb-4 text-xl font-semibold">여행 장소 목록</h2>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            장소 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : places.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-5 text-zinc-600">
            등록된 장소가 없습니다.
          </p>
        ) : (
          <ul className="space-y-4">
            {places.map((place) => (
              <li
                key={place.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <h2 className="mb-3 text-xl font-semibold">{place.name}</h2>
                <dl className="grid gap-2 text-sm sm:grid-cols-[6rem_1fr]">
                  <dt className="font-medium text-zinc-500">Category</dt>
                  <dd>{place.category}</dd>
                  <dt className="font-medium text-zinc-500">Status</dt>
                  <dd>{place.status}</dd>
                  <dt className="font-medium text-zinc-500">Address</dt>
                  <dd>{place.address ?? "주소 없음"}</dd>
                </dl>
                <Link
                  href={`/places/${place.id}`}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  상세보기
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
