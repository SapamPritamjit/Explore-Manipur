export interface DestinationRow {
  id: string;
  name: string;
  district: string | null;
  category: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_from_imphal: number | null;
  estimated_cost: number | null;
  estimated_visit_duration: string | null;
  best_time: string | null;
  tags: string[];
  opening_hours: string | null;
  contact: string | null;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodRow {
  id: string;
  name: string;
  location: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  cuisine: string | null;
  local_dishes: string[];
  price_range: string | null;
  opening_hours: string | null;
  contact: string | null;
  image_url: string | null;
  tags: string[];
  source_name: string | null;
  source_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExperienceRow {
  id: string;
  name: string;
  location: string | null;
  district: string | null;
  category: string;
  description: string | null;
  duration: string | null;
  estimated_cost: number | null;
  best_time: string | null;
  difficulty: string | null;
  booking_required: boolean | null;
  contact: string | null;
  image_url: string | null;
  tags: string[];
  source_name: string | null;
  source_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccommodationRow {
  id: string;
  name: string;
  location: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  type: string | null;
  price_range: string | null;
  facilities: string[];
  contact: string | null;
  booking_url: string | null;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRow {
  id: string;
  name: string;
  category: string | null;
  start_date: string | null;
  end_date: string | null;
  year: number | null;
  annual_or_one_time: string | null;
  location: string | null;
  district: string | null;
  description: string | null;
  organizer: string | null;
  official_url: string | null;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransportRow {
  id: string;
  origin: string;
  destination: string;
  transport_type: string | null;
  approx_distance: number | null;
  approx_time: string | null;
  notes: string | null;
  source_name: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}