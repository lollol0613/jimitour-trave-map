export type PlaceCategory =
  | "accommodation"
  | "restaurant"
  | "attraction"
  | "cafe"
  | "shopping"
  | "other";

export type PlaceStatus = "visited" | "wishlist";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  status: PlaceStatus;
  latitude: number;
  longitude: number;
  address: string | null;
  rating: number | null;
  memo: string | null;
  created_at: string;
}
