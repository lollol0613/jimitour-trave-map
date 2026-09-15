import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";

interface EditTripPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTripPage({ params }: EditTripPageProps) {
  const { id } = await params;

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, name, city, start_date, end_date, memo")
    .eq("id", id)
    .single();

  if (error || !trip) {
    notFound();
  }

  async function updateTrip(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const startDate = String(formData.get("start_date") ?? "").trim();
    const endDate = String(formData.get("end_date") ?? "").trim();
    const memo = String(formData.get("memo") ?? "").trim();

    if (!name) {
      throw new Error("여행 이름은 필수입니다.");
    }

    const { error: updateError } = await supabase
      .from("trips")
      .update({
        name,
        city: city || null,
        start_date: startDate || null,
        end_date: endDate || null,
        memo: memo || null,
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    redirect(`/trips/${id}`);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-2xl">
        <Link
          href={`/trips/${id}`}
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 여행 일정으로 돌아가기
        </Link>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">일정 수정</h1>

          <form action={updateTrip} className="mt-6 space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                여행 이름
              </label>

              <input
                id="name"
                name="name"
                type="text"
                defaultValue={trip.name}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-medium">
                지역
              </label>

              <input
                id="city"
                name="city"
                type="text"
                defaultValue={trip.city ?? ""}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="start_date"
                  className="mb-2 block text-sm font-medium"
                >
                  시작일
                </label>

                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  defaultValue={trip.start_date ?? ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="end_date"
                  className="mb-2 block text-sm font-medium"
                >
                  종료일
                </label>

                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  defaultValue={trip.end_date ?? ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="memo" className="mb-2 block text-sm font-medium">
                메모
              </label>

              <textarea
                id="memo"
                name="memo"
                rows={5}
                defaultValue={trip.memo ?? ""}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href={`/trips/${id}`}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                취소
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
