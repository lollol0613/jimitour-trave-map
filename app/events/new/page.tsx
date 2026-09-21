import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function createEvent(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();

  const name = String(formData.get("name") || "").trim();
  const city = String(formData.get("city") || "").trim() || null;
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
  const eventMonth = Number(formData.get("event_month"));

  const { error } = await supabase.from("events").insert({
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
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/events");
}

export default function NewEventPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <section className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">이벤트 추가</h1>

        <form
          action={createEvent}
          className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">이벤트명</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">도시</label>
            <input
              name="city"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">월</label>
            <select
              name="event_month"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="">월 선택</option>
              <option value="1">1월</option>
              <option value="2">2월</option>
              <option value="3">3월</option>
              <option value="4">4월</option>
              <option value="5">5월</option>
              <option value="6">6월</option>
              <option value="7">7월</option>
              <option value="8">8월</option>
              <option value="9">9월</option>
              <option value="10">10월</option>
              <option value="11">11월</option>
              <option value="12">12월</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">시작일</label>
              <input
                type="date"
                name="start_date"
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">종료일</label>
              <input
                type="date"
                name="end_date"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">카테고리</label>
            <input
              name="category"
              placeholder="예: Marathon, Festival, Parade"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">주소</label>
            <input
              name="address"
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
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Image URL</label>
            <input
              name="image_url"
              type="url"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">메모</label>
            <textarea
              name="memo"
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            이벤트 저장
          </button>
        </form>
      </section>
    </main>
  );
}
