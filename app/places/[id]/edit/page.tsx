import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { getRatingLabel } from "@/lib/rating";
import type { Place } from "@/types/place";

interface EditPlacePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPlacePage({ params }: EditPlacePageProps) {
  const { id } = await params;

  const { data: place, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .single<Place>();

  if (error || !place) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-2xl">
        <Link
          href={`/places/${place.id}`}
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 상세페이지로 돌아가기
        </Link>

        <h1 className="mb-8 text-3xl font-bold tracking-tight">장소 수정</h1>

        <form className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium">장소명</label>
            <input
              type="text"
              name="name"
              defaultValue={place.name}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">카테고리</label>
            <select
              name="category"
              defaultValue={place.category}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="accommodation">🏨 숙박</option>
              <option value="restaurant">🍴 맛집</option>
              <option value="attraction">📍 가볼 곳</option>
              <option value="cafe">☕ 카페</option>
              <option value="shopping">🛍 쇼핑</option>
              <option value="other">📌 기타</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">도시</label>
            <input
              type="text"
              name="city"
              defaultValue={place.city ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">상태</label>
            <select
              name="status"
              defaultValue={place.status}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="wishlist">🟡 가보고 싶은 곳</option>
              <option value="visited">🟢 다녀온 곳</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">주소</label>
            <input
              type="text"
              name="address"
              defaultValue={place.address ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">위도</label>
              <input
                type="number"
                step="any"
                name="latitude"
                defaultValue={place.latitude}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">경도</label>
              <input
                type="number"
                step="any"
                name="longitude"
                defaultValue={place.longitude}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">평점</label>
            <select
              name="rating"
              defaultValue={place.rating === null ? "" : String(place.rating)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="">평점 없음</option>
              <option value="0">🚫 절대 가지 말기</option>
              <option value="1">👎 비추</option>
              <option value="2">😕 애매함</option>
              <option value="3">🙂 쏘쏘</option>
              <option value="4">👍 평타</option>
              <option value="4.5">⭐ 추천</option>
              <option value="5">🔥 개추</option>
            </select>

            <p className="mt-2 text-xs text-zinc-500">
              현재 평점: {getRatingLabel(place.rating)}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">메모</label>
            <textarea
              name="memo"
              rows={4}
              defaultValue={place.memo ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            수정 저장
          </button>
        </form>
      </section>
    </main>
  );
}
