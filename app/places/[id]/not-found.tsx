import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-medium text-blue-600">Jimitour</p>
        <h1 className="text-2xl font-bold tracking-tight">
          장소를 찾을 수 없습니다
        </h1>
        <p className="mt-3 text-zinc-600">
          요청한 장소가 없거나 정보를 불러오지 못했습니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          장소 목록으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
