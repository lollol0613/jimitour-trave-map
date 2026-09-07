import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

async function createPlace(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "");
  const category = String(formData.get("category") ?? "");
  const status = String(formData.get("status") ?? "");
  const address = String(formData.get("address") ?? "");
  const memo = String(formData.get("memo") ?? "");
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const ratingValue = formData.get("rating");
  const rating =
    ratingValue === null || String(ratingValue).trim() === ""
      ? null
      : Number(ratingValue);
  const { error } = await supabase.from("places").insert({
    name,
    category,
    status,
    address: address || null,
    rating,
    memo: memo || null,
    latitude,
    longitude,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/");
}

export default function NewPlacePage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 여행 지도으로 돌아가기
        </Link>

        <h1 className="mb-8 text-3xl font-bold tracking-tight">장소 추가</h1>

        <form
          action={createPlace}
          className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">장소명</label>
            <input
              type="text"
              name="name"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="예: Cordis Auckland"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">카테고리</label>
            <select
              name="category"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              defaultValue="accommodation"
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
            <label className="mb-2 block text-sm font-medium">상태</label>
            <select
              name="status"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              defaultValue="wishlist"
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
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="예: 83 Symonds Street, Auckland"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">위도</label>
              <input
                type="number"
                step="any"
                name="latitude"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                placeholder="-36.8567"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">경도</label>
              <input
                type="number"
                step="any"
                name="longitude"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                placeholder="174.7645"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">평점</label>

            <select
              name="rating"
              defaultValue=""
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
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">메모</label>
            <textarea
              name="memo"
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="이 장소에 대한 간단한 메모"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            장소 저장
          </button>
        </form>
      </section>
    </main>
  );
}
