import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import sharp from "sharp";

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

  const imageFile = formData.get("image_file");

  let finalImageUrl = imageUrl || null;

  if (imageFile instanceof File && imageFile.size > 0) {
    const inputBuffer = Buffer.from(await imageFile.arrayBuffer());

    const webpBuffer = await sharp(inputBuffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
      })
      .toBuffer();

    const fileName = `${crypto.randomUUID()}.webp`;

    const { error: uploadError } = await supabase.storage
      .from("place-image")
      .upload(fileName, webpBuffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("place-image")
      .getPublicUrl(fileName);

    finalImageUrl = publicUrlData.publicUrl;
  }

  const memo = String(formData.get("memo") || "").trim() || null;
  const tags = formData.getAll("tags").map((value) => String(value));

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
      image_url: finalImageUrl,
      memo,
      tags,
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
            <label className="mb-2 block text-sm font-medium">태그</label>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                name="tags"
                value="Baby"
                defaultChecked={event.tags?.includes("Baby") ?? false}
                className="h-4 w-4 rounded border-zinc-300"
              />

              <span>Baby</span>
            </label>
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
            <label className="mb-2 block text-sm font-medium">
              이미지 업로드
            </label>

            <input
              name="image_file"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-zinc-600
      file:mr-4
      file:rounded-md
      file:border-0
      file:bg-zinc-100
      file:px-4
      file:py-2
      file:text-sm
      file:font-medium
      hover:file:bg-zinc-200"
            />

            <p className="mt-1 text-xs text-zinc-500">
              새 이미지를 업로드하면 기존 이미지 URL보다 우선 적용됩니다.
            </p>
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
