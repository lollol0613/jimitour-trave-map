"use client";

import { useState } from "react";
import Link from "next/link";

type AddType = "place" | "event";

export default function AddPage() {
  const [addType, setAddType] = useState<AddType>("place");

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 여행 지도로 돌아가기
        </Link>

        <h1 className="mb-6 text-3xl font-bold">장소 / 이벤트 추가</h1>

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setAddType("place")}
            className={
              addType === "place"
                ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                : "rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            }
          >
            📍 장소 추가
          </button>

          <button
            type="button"
            onClick={() => setAddType("event")}
            className={
              addType === "event"
                ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                : "rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            }
          >
            🎆 이벤트 추가
          </button>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          {addType === "place" ? (
            <p className="text-zinc-600">여기에 장소 추가 폼이 들어갑니다.</p>
          ) : (
            <p className="text-zinc-600">여기에 이벤트 추가 폼이 들어갑니다.</p>
          )}
        </div>
      </section>
    </main>
  );
}
