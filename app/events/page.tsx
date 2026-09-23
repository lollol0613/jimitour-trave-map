import Link from "next/link";
import AdminOnly from "@/components/admin-only";
import { supabase } from "@/lib/supabase";
import EventBrowser from "@/components/event-browser";
export default async function EventsPage() {
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">
              New Zealand Events
            </p>
            <h1 className="mt-1 text-3xl font-bold">이벤트</h1>
          </div>

          <AdminOnly>
            <Link
              href="/add"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + 이벤트 추가
            </Link>
          </AdminOnly>
        </div>

        {!events || events.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-600">
            등록된 이벤트가 없습니다.
          </div>
        ) : (
          <EventBrowser events={events} />
        )}
      </section>
    </main>
  );
}
