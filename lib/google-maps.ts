const GOOGLE_MAPS_SEARCH_URL = "https://www.google.com/maps/search/";

export function getGoogleMapsSearchUrl(
  name: string,
  address: string | null,
) {
  const normalizedAddress = address?.trim();
  const query = normalizedAddress ? `${name}, ${normalizedAddress}` : name;
  const searchParams = new URLSearchParams({
    api: "1",
    query,
  });

  return `${GOOGLE_MAPS_SEARCH_URL}?${searchParams.toString()}`;
}
