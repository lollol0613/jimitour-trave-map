"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import TravelMap from "@/components/travel-map";
import { getRatingLabel } from "@/lib/rating";
import type { Place } from "@/types/place";
import { getGoogleMapsSearchUrl } from "@/lib/google-maps";
import AdminOnly from "@/components/admin-only";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

const supabase = createBrowserSupabaseClient();

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
  | "image_url"
>;

type EventListItem = {
  id: string;
  name: string;
  city: string | null;
  start_date: string;
  end_date: string | null;
  event_month: number | null;
  category: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  memo: string | null;
};

type FilterCategory =
  | "all"
  | "accommodation"
  | "restaurant"
  | "attraction"
  | "cafe"
  | "shopping"
  | "event"
  | "other";

interface PlaceBrowserProps {
  places: PlaceListItem[];
  events: EventListItem[];
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
  { value: "shopping", label: "🛒 쇼핑" },
  { value: "event", label: "🎆 이벤트" },
  { value: "other", label: "📌 기타" },
];

function getCategoryLabel(category: FilterCategory) {
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
      return "🛒 쇼핑";
    case "event":
      return "🎆 이벤트";
    default:
      return "📌 기타";
  }
}

export default function PlaceBrowser({ places, events }: PlaceBrowserProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("all");

  const [selectedCity, setSelectedCity] = useState<string>("all");

  const [selectedIsland, setSelectedIsland] = useState<
    "all" | "north" | "south"
  >("all");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "visited" | "wishlist"
  >("all");

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  const PAGE_SIZE = 20;

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    selectedCity,
    selectedCategory,
    selectedIsland,
    selectedStatus,
    selectedMonth,
    searchQuery,
  ]);

  const NORTH_ISLAND_CITIES = [
    "Auckland",
    "Cambridge",
    "Coromandel",
    "Hamilton",
    "Karangahake",
    "Kerikeri",
    "Matamata",
    "Muriwai",
    "New Plymouth",
    "Northland",
    "Paeroa",
    "Pokeno",
    "Putaruru",
    "Rotorua",
    "Taupo",
    "Waikato",
    "Waitomo",
    "Waiuku",
    "Wellington",
    "Whangarei",
    "Northland",
    "Tongariro",
    "Raglan",
    "Hastings",
    "Napier",
    "Tauranga",
    "Wairarapa",
  ];

  const SOUTH_ISLAND_CITIES = [
    "Arrowtown",
    "Christchurch",
    "Cromwell",
    "Lyttelton",
    "Milford Sound",
    "Mt.Cook",
    "Queenstown",
    "Tekapo",
    "Twizel",
    "Wanaka",
    "West Coast",
    "Blenheim",
    "Otago",
    "Methven",
    "Hanmer Springs",
    "Bluff",
    "Dunedin",
    "Oamaru",
    "Tasman",
    "Kapiti Coast",
    "Te A Nau",
  ];

  const cities = Array.from(
    new Set(
      places
        .map((place) => place.city)
        .filter((city): city is string => Boolean(city)),
    ),
  ).sort();

  const visibleCities = cities.filter((city) => {
    if (selectedIsland === "all") {
      return true;
    }

    if (selectedIsland === "north") {
      return NORTH_ISLAND_CITIES.includes(city);
    }

    return SOUTH_ISLAND_CITIES.includes(city);
  });

  const combinedItems = [
    ...places.map((place) => ({
      ...place,
      itemType: "place" as const,
      event_month: null,
      start_date: null,
      end_date: null,
    })),

    ...events.map((event) => ({
      id: event.id,
      name: event.name,
      category: "event" as const,
      status: null,
      latitude: event.latitude,
      longitude: event.longitude,
      address: event.address,
      city: event.city,
      rating: null,
      memo: event.memo,
      image_url: event.image_url,
      itemType: "event" as const,
      event_month: event.event_month,
      start_date: event.start_date,
      end_date: event.end_date,
    })),
  ];

  const filteredPlaces = combinedItems.filter((place) => {
    const matchesCategory =
      selectedCategory === "all" || place.category === selectedCategory;

    const matchesCity = selectedCity === "all" || place.city === selectedCity;

    const matchesStatus =
      place.itemType === "event"
        ? true
        : selectedStatus === "all" || place.status === selectedStatus;

    const query = searchQuery.trim().toLowerCase();

    const matchesMonth =
      place.itemType !== "event" ||
      selectedMonth === "all" ||
      place.event_month === selectedMonth;

    const matchesSearch =
      query === "" ||
      place.name.toLowerCase().includes(query) ||
      (place.city ?? "").toLowerCase().includes(query);

    return (
      matchesCategory &&
      matchesCity &&
      matchesStatus &&
      matchesMonth &&
      matchesSearch
    );
  });

  return (
    <div className="mx-auto grid w-full gap-6 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
      <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-4 shadow-sm xl:sticky xl:top-6">
        <h2 className="mb-4 text-xl font-semibold">필터</h2>
        <div className="mb-5">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="장소 이름 또는 도시 검색"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { value: "all", label: "전체 상태" },
            { value: "wishlist", label: "🟡 Wishlist" },
            { value: "visited", label: "🟢 지미 Pick" },
          ].map((status) => {
            const selected = status.value === selectedStatus;

            return (
              <button
                key={status.value}
                type="button"
                onClick={() =>
                  setSelectedStatus(
                    status.value as "all" | "visited" | "wishlist",
                  )
                }
                className={
                  selected
                    ? "rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                    : "rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                }
              >
                {status.label}
              </button>
            );
          })}
        </div>
        <div className="mb-5">
          <h2 className="mb-3 text-xl font-semibold">지역 선택</h2>

          <div className="mb-3 flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "north", label: "North Island" },
              { value: "south", label: "South Island" },
            ].map((island) => {
              const selected = island.value === selectedIsland;

              return (
                <button
                  key={island.value}
                  type="button"
                  onClick={() => {
                    setSelectedIsland(
                      island.value as "all" | "north" | "south",
                    );
                    setSelectedCity("all");
                  }}
                  className={
                    selected
                      ? "rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                      : "rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                  }
                >
                  {island.label}
                </button>
              );
            })}
          </div>

          <div className="min-w-0 overflow-x-auto pb-2">
            <div className="flex w-max gap-2">
              {["all", ...visibleCities].map((city) => {
                const selected = city === selectedCity;

                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={
                      selected
                        ? "shrink-0 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                        : "shrink-0 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                    }
                  >
                    {city === "all" ? "All" : city}
                  </button>
                );
              })}
            </div>
          </div>
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

        {selectedCategory === "event" && (
          <div className="mb-6 min-w-0 overflow-x-auto pb-2">
            <div className="flex w-max gap-2">
              <button
                type="button"
                onClick={() => setSelectedMonth("all")}
                className={
                  selectedMonth === "all"
                    ? "shrink-0 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                    : "shrink-0 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                }
              >
                전체 월
              </button>

              {Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;

                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => setSelectedMonth(month)}
                    className={
                      selectedMonth === month
                        ? "shrink-0 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                        : "shrink-0 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                    }
                  >
                    {month}월
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>
      <div className="min-w-0">
        <section aria-labelledby="map-heading">
          <TravelMap
            places={filteredPlaces.filter(
              (item): item is typeof item & { itemType: "place" } =>
                item.itemType === "place",
            )}
            selectedPlaceId={selectedPlaceId}
            selectedCity={selectedCity}
          />
        </section>
      </div>

      <aside className="xl:max-h-[760px] xl:overflow-y-auto xl:pr-2">
        <h2 className="mb-4 text-xl font-semibold">여행 장소 목록</h2>

        {filteredPlaces.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-5 text-zinc-600">
            해당 조건에 등록된 장소가 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredPlaces.slice(0, visibleCount).map((place) => (
              <li
                key={place.id}
                onClick={() => setSelectedPlaceId(place.id)}
                className="relative cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <AdminOnly>
                  <button
                    type="button"
                    onClick={async (event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      const confirmed = window.confirm(
                        `"${place.name}"을(를) 완전히 삭제할까요?\n일정에 추가되어 있다면 해당 일정에서도 함께 제거됩니다.`,
                      );

                      if (!confirmed) {
                        return;
                      }

                      const { error } = await supabase
                        .from("places")
                        .delete()
                        .eq("id", place.id);

                      if (error) {
                        console.error("Failed to delete place:", error);
                        alert("삭제 중 오류가 발생했습니다.");
                        return;
                      }

                      window.location.reload();
                    }}
                    className="absolute -right-1 -top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-sm text-zinc-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label={`${place.name} 삭제`}
                    title="삭제"
                  >
                    ×
                  </button>
                </AdminOnly>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{place.name}</h3>

                    <p className="mt-1 text-sm text-zinc-600">
                      {getCategoryLabel(place.category)}
                      {place.city ? ` · ${place.city}` : ""}
                    </p>

                    {place.itemType === "event" ? (
                      <p className="mt-1 text-sm text-zinc-500">
                        {place.start_date}
                        {place.end_date && place.end_date !== place.start_date
                          ? ` ~ ${place.end_date}`
                          : ""}

                        {place.event_month && (
                          <span className="ml-2">
                            · 매년 {place.event_month}월
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-zinc-500">
                        {getRatingLabel(place.rating)}
                      </p>
                    )}
                  </div>

                  {place.image_url && (
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Link
                    href={
                      place.itemType === "event"
                        ? `/events/${place.id}`
                        : `/places/${place.id}`
                    }
                    onClick={(event) => event.stopPropagation()}
                    className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    상세보기
                  </Link>

                  <a
                    href={
                      place.itemType === "event"
                        ? getGoogleMapsSearchUrl(
                            place.address || place.city || place.name,
                            null,
                          )
                        : getGoogleMapsSearchUrl(place.name, place.address)
                    }
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    {place.itemType === "event"
                      ? "행사 위치 보기"
                      : "Google Maps에서 보기"}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
        {visibleCount < filteredPlaces.length && (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="mt-4 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            더 보기 ({filteredPlaces.length - visibleCount}개 남음)
          </button>
        )}
      </aside>
    </div>
  );
}
