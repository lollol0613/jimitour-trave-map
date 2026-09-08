import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

interface TripPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("trips")
    .insert({
      name,
      memo: memo || null,
    })
    .select("id")
    .single();

  if (error || !trip) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 여행 지도로 돌아가기
        </Link>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-blue-600">여행 일정</p>

          <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>

          <div className="mt-6 space-y-3 text-sm text-zinc-700">
            <p>
              <strong className="font-medium text-zinc-950">시작일:</strong>{" "}
              {trip.start_date ?? "미정"}
            </p>

            <p>
              <strong className="font-medium text-zinc-950">종료일:</strong>{" "}
              {trip.end_date ?? "미정"}
            </p>

            <p>
              <strong className="font-medium text-zinc-950">메모:</strong>{" "}
              {trip.memo ?? "메모 없음"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
