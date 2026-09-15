"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Place } from "@/types/place";
import { getRatingLabel } from "@/lib/rating";

const AUCKLAND_CENTER: [number, number] = [174.7633, -36.8485];

type MapPlace = Pick<
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
  | "image_url"
>;

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

function getCategoryIcon(category: Place["category"]) {
  switch (category) {
    case "accommodation":
      return "🏨";
    case "restaurant":
      return "🍴";
    case "attraction":
      return "📍";
    case "cafe":
      return "☕";
    case "shopping":
      return "🛍";
    default:
      return "📌";
  }
}

interface TravelMapProps {
  places: MapPlace[];
  selectedPlaceId: string | null;
  selectedCity: string;
}

function createPopupContent(place: MapPlace) {
  const content = document.createElement("div");
  content.className = "space-y-1 pr-4 pt-1 text-sm text-zinc-700";

  if (place.image_url) {
    const image = document.createElement("img");

    image.src = place.image_url;
    image.alt = place.name;
    image.className = "mb-3 h-20 w-full rounded-lg object-cover";

    content.appendChild(image);
  }

  const title = document.createElement("h3");
  title.className = "mb-2 text-base font-semibold text-zinc-950";
  title.textContent = place.name;
  content.appendChild(title);

  const details = [
    ["카테고리", getCategoryLabel(place.category)],
    ["주소", place.address ?? "주소 없음"],
    ["평점", getRatingLabel(place.rating)],
  ];

  for (const [label, value] of details) {
    const row = document.createElement("p");
    const labelElement = document.createElement("strong");
    labelElement.className = "font-medium text-zinc-950";
    labelElement.textContent = `${label}: `;
    row.append(labelElement, document.createTextNode(value));
    content.appendChild(row);
  }

  if (place.memo) {
    const memo = document.createElement("p");
    memo.className =
      "mt-3 border-t border-zinc-200 pt-3 leading-relaxed text-zinc-600";
    memo.textContent = place.memo;
    content.appendChild(memo);
  }

  const statusBadge = document.createElement("span");

  statusBadge.className =
    place.status === "visited"
      ? "mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
      : "mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700";

  statusBadge.textContent =
    place.status === "visited" ? "🟢 다녀온 곳" : "🟡 가보고 싶은 곳";

  content.appendChild(statusBadge);

  return content;
}

const CITY_CENTERS: Record<string, [number, number]> = {
  Auckland: [174.7633, -36.8485],
  Hamilton: [175.2793, -37.787],
  Rotorua: [176.2497, -38.1368],
  Taupo: [176.0702, -38.6857],
  Wellington: [174.7762, -41.2866],
  Whangarei: [174.3237, -35.7251],
  "New Plymouth": [174.0632, -39.0556],

  Christchurch: [172.6362, -43.5321],
  Queenstown: [168.6626, -45.0312],
  Wanaka: [169.1321, -44.6967],
  Cromwell: [169.2004, -45.0384],
  Tekapo: [170.4806, -44.0047],
  Twizel: [170.0986, -44.2594],
  "Milford Sound": [167.9256, -44.6714],
  "Mt.Cook": [170.0967, -43.734],
};

export default function TravelMap({
  places,
  selectedPlaceId,
  selectedCity,
}: TravelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<Record<string, maplibregl.Marker>>({});

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: AUCKLAND_CENTER,
      zoom: 12,
    });
    mapRef.current = map;

    map.on("error", (event) => {
      console.error("MapLibre error:", event.error);
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const markers = places
      .filter(
        (place) =>
          Number.isFinite(place.longitude) && Number.isFinite(place.latitude),
      )
      .map((place) => {
        const popup = new maplibregl.Popup({
          offset: 24,
          maxWidth: "280px",
        }).setDOMContent(createPopupContent(place));

        const markerElement = document.createElement("div");

        markerElement.textContent = getCategoryIcon(place.category);
        markerElement.className =
          "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-xl shadow-md";

        const marker = new maplibregl.Marker({
          element: markerElement,
        })
          .setLngLat([place.longitude, place.latitude])
          .setPopup(popup)
          .addTo(map);

        markerRefs.current[place.id] = marker;

        return marker;
      });

    return () => {
      markers.forEach((marker) => marker.remove());
      markerRefs.current = {};
    };
  }, [places]);

  useEffect(() => {
    if (!selectedPlaceId) {
      return;
    }

    const map = mapRef.current;
    const marker = markerRefs.current[selectedPlaceId];

    if (!map || !marker) {
      return;
    }

    const lngLat = marker.getLngLat();

    map.flyTo({
      center: [lngLat.lng, lngLat.lat],
      zoom: 14,
      essential: true,
    });

    marker.togglePopup();
  }, [selectedPlaceId]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (selectedCity === "all") {
      return;
    }

    const center = CITY_CENTERS[selectedCity];

    if (!center) {
      return;
    }

    mapRef.current.flyTo({
      center,
      zoom: 11,
      essential: true,
    });
  }, [selectedCity]);

  return (
    <div
      ref={mapContainerRef}
      role="region"
      aria-label="Auckland 여행 지도"
      className="h-[420px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 shadow-sm"
    />
  );
}
