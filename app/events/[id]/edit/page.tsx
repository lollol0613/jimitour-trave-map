import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function updateEvent(eventId: string, formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();

  const name = String(formData.get("name") || "").trim();
  const city = String(formData.get("city") || "").trim() || null;
  const eventMonth = Number(formData.get("event_month"));
  const startDate = String(formData.get("start_date") || "");
  const endDate = String(formData.get("end_date") || "") || null;
  const category = String(formData.get("category") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const websiteUrl = String(formData.get("website_url") || "").trim() || null;
  const imageUrl = String(formData.get("image_url") || "").trim() || null;
  const memo = String(formData.get("memo") || "").trim() || null;

  const latitudeValue = String(formData.get("latitude") || "").trim();
  const longitudeValue = String(formData.get("longitude") || "").trim();

  const latitude = latitudeValue ? Number(latitudeValue) : null;
  const longitude = longitudeValue ? Number(longitudeValue) : null;

  const { error } = await supabase
    .from("events")
    .update({
      name,
      city,
      event_month: eventMonth,
      start_date: startDate,
      end_date: endDate,
      category,
      address,
      latitude,
      longitude,
      website_url: websiteUrl,
      image_url: imageUrl,
      memo,
    })
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/events/${eventId}`);
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <section className="mx-auto max-w-2xl">
        <Link
          href={`/events/${event.id}`}
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 이벤트로 돌아가기
        </Link>

        <h1 className="mb-6 text-3xl font-bold">이벤트 수정</h1>

        <form
          action={updateEvent.bind(null, event.id)}
          className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">이벤트명</label>
            <input
              name="name"
              defaultValue={event.name}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">도시</label>
            <input
              name="city"
              defaultValue={event.city ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">월</label>
            <select
              name="event_month"
              defaultValue={event.event_month ?? ""}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="">월 선택</option>
              {Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;

                return (
                  <option key={month} value={month}>
                    {month}월
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">시작일</label>
              <input
                type="date"
                name="start_date"
                defaultValue={event.start_date}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">종료일</label>
              <input
                type="date"
                name="end_date"
                defaultValue={event.end_date ?? ""}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">카테고리</label>
            <input
              name="category"
              defaultValue={event.category ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">주소</label>
            <input
              name="address"
              defaultValue={event.address ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Latitude</label>
              <input
                name="latitude"
                type="number"
                step="any"
                defaultValue={event.latitude ?? ""}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Longitude
              </label>
              <input
                name="longitude"
                type="number"
                step="any"
                defaultValue={event.longitude ?? ""}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Website URL
            </label>
            <input
              name="website_url"
              type="url"
              defaultValue={event.website_url ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Image URL</label>
            <input
              name="image_url"
              type="url"
              defaultValue={event.image_url ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">메모</label>
            <textarea
              name="memo"
              rows={4}
              defaultValue={event.memo ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            수정 저장
          </button>
        </form>
      </section>
    </main>
  );
}
