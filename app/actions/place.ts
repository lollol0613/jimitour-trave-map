"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function formatPlaceName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, "");
}

export async function createPlace(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const name = formatPlaceName(String(formData.get("name") ?? ""));
  const category = String(formData.get("category") ?? "");
  const status = String(formData.get("status") ?? "");
  const address = String(formData.get("address") ?? "");
  const city = String(formData.get("city") ?? "").trim();
  const memo = String(formData.get("memo") ?? "");
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const ratingValue = formData.get("rating");
  const imageUrl = String(formData.get("image_url") ?? "").trim();

  const rating =
    ratingValue === null || String(ratingValue).trim() === ""
      ? null
      : Number(ratingValue);

  const { data: existingPlaces, error: existingError } = await supabase
    .from("places")
    .select("id, name, city");

  if (existingError) {
    throw new Error(existingError.message);
  }

  const normalizedName = normalizeText(name);
  const normalizedCity = normalizeText(city);

  const duplicatePlace = existingPlaces?.find((place) => {
    const existingName = normalizeText(place.name ?? "");
    const existingCity = normalizeText(place.city ?? "");

    return existingName === normalizedName && existingCity === normalizedCity;
  });

  if (duplicatePlace) {
    throw new Error("이미 등록된 장소입니다.");
  }

  const { error: insertError } = await supabase.from("places").insert({
    name,
    category,
    status,
    address: address || null,
    city: city || null,
    rating,
    memo: memo || null,
    latitude,
    longitude,
    image_url: imageUrl || null,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  redirect("/");
}
