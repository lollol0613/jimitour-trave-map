import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminOnly from "@/components/admin-only";
import { getGoogleMapsSearchUrl } from "@/lib/google-maps";

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
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
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 여행 지도로 돌아가기
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.name}
                className="w-full rounded-xl border border-zinc-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400">
                이미지 없음
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-medium text-blue-600">
                  🎆 이벤트
                </p>

                <h1 className="text-3xl font-bold tracking-tight">
                  {event.name}
                </h1>
              </div>

              <AdminOnly>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="shrink-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  수정
                </Link>
              </AdminOnly>
            </div>

            <div className="space-y-3 text-sm text-zinc-700">
              {event.event_month && (
                <p>
                  <strong className="font-medium text-zinc-950">
                    개최 월:
                  </strong>{" "}
                  매년 {event.event_month}월
                </p>
              )}
              <p>
                <strong className="font-medium text-zinc-950">날짜:</strong>{" "}
                {event.start_date}
                {event.end_date && event.end_date !== event.start_date
                  ? ` ~ ${event.end_date}`
                  : ""}
              </p>

              {event.city && (
                <p>
                  <strong className="font-medium text-zinc-950">도시:</strong>{" "}
                  {event.city}
                </p>
              )}

              {event.address && (
                <p>
                  <strong className="font-medium text-zinc-950">주소:</strong>{" "}
                  {event.address}
                </p>
              )}

              {event.category && (
                <p>
                  <strong className="font-medium text-zinc-950">
                    카테고리:
                  </strong>{" "}
                  {event.category}
                </p>
              )}

              {event.memo && (
                <div>
                  <strong className="font-medium text-zinc-950">메모:</strong>
                  <p className="mt-1 whitespace-pre-wrap leading-6">
                    {event.memo}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={getGoogleMapsSearchUrl(
                  event.address || event.city || event.name,
                  null,
                )}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                행사 위치 보기
              </a>

              {event.website_url && (
                <a
                  href={event.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  공식 웹사이트
                </a>
              )}

              <AdminOnly>
                <Link
                  href={`/events/${event.id}/add-to-trip`}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  + 일정에 추가
                </Link>
              </AdminOnly>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
