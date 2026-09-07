import Link from "next/link";
import { notFound } from "next/navigation";

import { getGoogleMapsSearchUrl } from "@/lib/google-maps";
import { supabase } from "@/lib/supabase";
import type { Place } from "@/types/place";

type PlaceDetail = Pick<
  Place,
  "id" | "name" | "category" | "status" | "address" | "rating" | "memo"
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

interface PlacePageProps {
  params: Promise<{ id: string }>;
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const { data: place, error } = await supabase
    .from("places")
    .select("id, name, category, status, address, rating, memo")
    .eq("id", id)
    .returns<PlaceDetail[]>()
    .maybeSingle();

  if (error || !place) {
    notFound();
  }

  const googleMapsUrl = getGoogleMapsSearchUrl(place.name, place.address);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <article className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 장소 목록으로
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-600">Jimitour</p>
          <h1 className="text-3xl font-bold tracking-tight">{place.name}</h1>
        </header>

        <dl className="grid gap-x-6 gap-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-[8rem_1fr]">
          <dt className="font-medium text-zinc-500">Category</dt>
          <dd>{getCategoryLabel(place.category)}</dd>

          <dt className="font-medium text-zinc-500">Status</dt>

          <dd>
            <span
              className={
                place.status === "visited"
                  ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                  : "inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700"
              }
            >
              {place.status === "visited"
                ? "🟢 다녀온 곳"
                : "🟡 가보고 싶은 곳"}
            </span>
          </dd>

          <dt className="font-medium text-zinc-500">Address</dt>
          <dd>{place.address ?? "주소 없음"}</dd>

          <dt className="font-medium text-zinc-500">Rating</dt>
          <dd>{place.rating ?? "평점 없음"}</dd>

          <dt className="font-medium text-zinc-500">Memo</dt>
          <dd className="whitespace-pre-wrap">{place.memo ?? "메모 없음"}</dd>
        </dl>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Google Maps에서 보기
        </a>
      </article>
    </main>
  );
}
