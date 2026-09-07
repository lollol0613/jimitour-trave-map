"use client";

import { useState } from "react";
import Link from "next/link";

import TravelMap from "@/components/travel-map";
import { getRatingLabel } from "@/lib/rating";
import type { Place } from "@/types/place";

type PlaceListItem = Pick<
  Place,
  | "id"
  | "name"
  | "category"
  | "status"
  | "latitude"
  | "longitude"
  | "address"
  | "rating"
  | "memo"
>;

type FilterCategory = "all" | Place["category"];

interface PlaceBrowserProps {
  places: PlaceListItem[];
}

const filters: {
  value: FilterCategory;
  label: string;
}[] = [
  { value: "all", label: "전체" },
  { value: "accommodation", label: "🏨 숙박" },
  { value: "restaurant", label: "🍴 맛집" },
  { value: "attraction", label: "📍 가볼 곳" },
  { value: "cafe", label: "☕ 카페" },
  { value: "shopping", label: "🛍 쇼핑" },
  { value: "other", label: "📌 기타" },
];

function getCategoryLabel(category: Place["category"]) {
  switch (category) {
    case "accommodation":
      return "🏨 숙박";
    case "restaurant":
      return "🍴 맛집";
    case "attraction":
      return "📍 가볼 곳";
    case "cafe":
      return "☕ 카페";
    case "shopping":
      return "🛍 쇼핑";
    default:
      return "📌 기타";
  }
}

export default function PlaceBrowser({ places }: PlaceBrowserProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("all");

  const filteredPlaces =
    selectedCategory === "all"
      ? places
      : places.filter((place) => place.category === selectedCategory);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const selected = filter.value === selectedCategory;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setSelectedCategory(filter.value)}
              className={
                selected
                  ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              }
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <section aria-labelledby="map-heading" className="mb-12">
        <h2 id="map-heading" className="mb-4 text-xl font-semibold">
          지도
        </h2>

        <TravelMap places={filteredPlaces} />
      </section>

      <h2 className="mb-4 text-xl font-semibold">여행 장소 목록</h2>

      {filteredPlaces.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-5 text-zinc-600">
          해당 카테고리에 등록된 장소가 없습니다.
        </p>
      ) : (
        <ul className="space-y-4">
          {filteredPlaces.map((place) => (
            <li
              key={place.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <h2 className="mb-3 text-xl font-semibold">{place.name}</h2>

              <dl className="grid gap-2 text-sm sm:grid-cols-[6rem_1fr]">
                <dt className="font-medium text-zinc-500">Category</dt>
                <dd>{getCategoryLabel(place.category)}</dd>

                <dt className="font-medium text-zinc-500">Address</dt>
                <dd>{place.address ?? "주소 없음"}</dd>

                <dt className="font-medium text-zinc-500">Rating</dt>
                <dd>{getRatingLabel(place.rating)}</dd>
              </dl>

              {place.memo && (
                <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                  {place.memo}
                </p>
              )}

              <Link
                href={`/places/${place.id}`}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                상세보기
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
