"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type RoutePlace = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  position: number;
};

interface TripRouteMapProps {
  places: RoutePlace[];
}

export default function TripRouteMap({ places }: TripRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || places.length === 0) {
      return;
    }

    maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

    const firstPlace = places[0];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [firstPlace.longitude, firstPlace.latitude],
      zoom: 12,
    });

    const sortedPlaces = [...places].sort((a, b) => a.position - b.position);

    sortedPlaces.forEach((place) => {
      const markerElement = document.createElement("div");

      markerElement.textContent = String(place.position);
      markerElement.className =
        "flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md";

      new maplibregl.Marker({
        element: markerElement,
      })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 20 }).setText(
            `${place.position}. ${place.name}`,
          ),
        )
        .addTo(map);
    });

    map.on("load", () => {
      if (sortedPlaces.length < 2) {
        return;
      }

      const coordinates = sortedPlaces.map((place) => [
        place.longitude,
        place.latitude,
      ]);

      map.addSource("trip-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      });

      map.addLayer({
        id: "trip-route-line",
        type: "line",
        source: "trip-route",
        paint: {
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });

      const bounds = new maplibregl.LngLatBounds();

      sortedPlaces.forEach((place) => {
        bounds.extend([place.longitude, place.latitude]);
      });

      map.fitBounds(bounds, {
        padding: 60,
        maxZoom: 14,
      });
    });

    return () => {
      map.remove();
    };
  }, [places]);

  if (places.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">
        이 Day에는 아직 지도에 표시할 장소가 없습니다.
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-[420px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200"
    />
  );
}
