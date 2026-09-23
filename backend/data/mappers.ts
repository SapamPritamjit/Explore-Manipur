import type { TourismCandidate } from "@/backend/recommendation";
import type {
  Accommodation,
  Destination,
  EventItem,
  Experience,
  Food,
  TransportRoute,
} from "./types";
import type {
  AccommodationRow,
  DestinationRow,
  EventRow,
  ExperienceRow,
  FoodRow,
  TransportRow,
} from "./rows";

export function mapDestination(row: DestinationRow): Destination {
  return {
    id: row.id,
    name: row.name,
    district: row.district,
    category: row.category,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    distanceFromImphal: row.distance_from_imphal,
    estimatedCost: row.estimated_cost,
    estimatedVisitDuration: row.estimated_visit_duration,
    bestTime: row.best_time,
    tags: row.tags ?? [],
    openingHours: row.opening_hours,
    contact: row.contact,
    imageUrl: row.image_url,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapFood(row: FoodRow): Food {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    district: row.district,
    latitude: row.latitude,
    longitude: row.longitude,
    cuisine: row.cuisine,
    localDishes: row.local_dishes ?? [],
    priceRange: row.price_range,
    openingHours: row.opening_hours,
    contact: row.contact,
    imageUrl: row.image_url,
    tags: row.tags ?? [],
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    district: row.district,
    category: row.category,
    description: row.description,
    duration: row.duration,
    estimatedCost: row.estimated_cost,
    bestTime: row.best_time,
    difficulty: row.difficulty,
    bookingRequired: row.booking_required,
    contact: row.contact,
    imageUrl: row.image_url,
    tags: row.tags ?? [],
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAccommodation(row: AccommodationRow): Accommodation {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    district: row.district,
    latitude: row.latitude,
    longitude: row.longitude,
    type: row.type,
    priceRange: row.price_range,
    facilities: row.facilities ?? [],
    contact: row.contact,
    bookingUrl: row.booking_url,
    imageUrl: row.image_url,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEvent(row: EventRow): EventItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    startDate: row.start_date,
    endDate: row.end_date,
    year: row.year,
    annualOrOneTime: row.annual_or_one_time,
    location: row.location,
    district: row.district,
    description: row.description,
    organizer: row.organizer,
    officialUrl: row.official_url,
    imageUrl: row.image_url,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTransport(row: TransportRow): TransportRoute {
  return {
    id: row.id,
    origin: row.origin,
    destination: row.destination,
    transportType: row.transport_type,
    approxDistance: row.approx_distance,
    approxTime: row.approx_time,
    notes: row.notes,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toTourismCandidate(destination: Destination): TourismCandidate {
  const hasCoordinates =
    destination.latitude !== null && destination.longitude !== null;
  return {
    id: destination.id,
    name: destination.name,
    category: destination.category,
    tags: destination.tags,
    district: destination.district,
    coordinates: hasCoordinates
      ? {
          latitude: destination.latitude as number,
          longitude: destination.longitude as number,
        }
      : null,
    distanceFromImphal: destination.distanceFromImphal,
    estimatedCost: destination.estimatedCost,
    estimatedVisitDuration: destination.estimatedVisitDuration,
    bestTime: destination.bestTime,
  };
}

export function toTourismCandidates(
  destinations: readonly Destination[]
): TourismCandidate[] {
  return destinations.map(toTourismCandidate);
}