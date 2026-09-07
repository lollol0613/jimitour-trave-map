"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Place } from "@/types/place";

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
>;

interface TravelMapProps {
  places: MapPlace[];
}

function createPopupContent(place: MapPlace) {
  const content = document.createElement("div");
  content.className = "space-y-1 text-sm text-zinc-700";

  const title = document.createElement("h3");
  title.className = "mb-2 text-base font-semibold text-zinc-950";
  title.textContent = place.name;
  content.appendChild(title);

  const details = [
    ["주소", place.address ?? "주소 없음"],
    ["평점", place.rating === null ? "평점 없음" : String(place.rating)],
    ["상태", place.status],
  ];

  for (const [label, value] of details) {
    const row = document.createElement("p");
    const labelElement = document.createElement("strong");
    labelElement.className = "font-medium text-zinc-950";
    labelElement.textContent = `${label}: `;
    row.append(labelElement, document.createTextNode(value));
    content.appendChild(row);
  }

  return content;
}

export default function TravelMap({ places }: TravelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: AUCKLAND_CENTER,
      zoom: 10,
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
          place.category === "accommodation" &&
          Number.isFinite(place.longitude) &&
          Number.isFinite(place.latitude),
      )
      .map((place) => {
        const popup = new maplibregl.Popup({ offset: 24, maxWidth: "280px" })
          .setDOMContent(createPopupContent(place));

        return new maplibregl.Marker()
          .setLngLat([place.longitude, place.latitude])
          .setPopup(popup)
          .addTo(map);
      });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [places]);

  return (
    <div
      ref={mapContainerRef}
      role="region"
      aria-label="Auckland 여행 지도"
      className="h-[420px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 shadow-sm"
    />
  );
}
