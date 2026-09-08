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
  | "city"
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

  const [selectedCity, setSelectedCity] = useState<string>("all");

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const cities = Array.from(
    new Set(
      places
        .map((place) => place.city)
        .filter((city): city is string => Boolean(city)),
    ),
  ).sort();

  const filteredPlaces = places.filter((place) => {
    const matchesCategory =
      selectedCategory === "all" || place.category === selectedCategory;

    const matchesCity = selectedCity === "all" || place.city === selectedCity;

    return matchesCategory && matchesCity;
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {["all", ...cities].map((city) => {
            const selected = city === selectedCity;

            return (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={
                  selected
                    ? "rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                    : "rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                }
              >
                {city === "all" ? "전체 지역" : city}
              </button>
            );
          })}
        </div>

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

        <section aria-labelledby="map-heading">
          <h2 id="map-heading" className="mb-4 text-xl font-semibold">
            지도
          </h2>

          <TravelMap
            places={filteredPlaces}
            selectedPlaceId={selectedPlaceId}
          />
        </section>
      </div>

      <aside className="lg:max-h-[620px] lg:overflow-y-auto lg:pr-2">
        <h2 className="mb-4 text-xl font-semibold">여행 장소 목록</h2>

        {filteredPlaces.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-5 text-zinc-600">
            해당 조건에 등록된 장소가 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredPlaces.map((place) => (
              <li
                key={place.id}
                onClick={() => setSelectedPlaceId(place.id)}
                className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{place.name}</h3>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                      <span>{getCategoryLabel(place.category)}</span>
                      <span>·</span>
                      <span>{getRatingLabel(place.rating)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/places/${place.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      상세보기
                    </Link>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        place.address
                          ? `${place.name}, ${place.address}`
                          : place.name,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                    >
                      Google Maps
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
