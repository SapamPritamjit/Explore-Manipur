export interface Destination {
  id: string;
  name: string;
  district: string | null;
  category: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceFromImphal: number | null;
  estimatedCost: number | null;
  estimatedVisitDuration: string | null;
  bestTime: string | null;
  tags: string[];
  openingHours: string | null;
  contact: string | null;
  imageUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationFilters {
  district?: string;
  category?: string;
  interests?: string[];
}

export interface Food {
  id: string;
  name: string;
  location: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  cuisine: string | null;
  localDishes: string[];
  priceRange: string | null;
  openingHours: string | null;
  contact: string | null;
  imageUrl: string | null;
  tags: string[];
  sourceName: string | null;
  sourceUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  name: string;
  location: string | null;
  district: string | null;
  category: string;
  description: string | null;
  duration: string | null;
  estimatedCost: number | null;
  bestTime: string | null;
  difficulty: string | null;
  bookingRequired: boolean | null;
  contact: string | null;
  imageUrl: string | null;
  tags: string[];
  sourceName: string | null;
  sourceUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Accommodation {
  id: string;
  name: string;
  location: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  type: string | null;
  priceRange: string | null;
  facilities: string[];
  contact: string | null;
  bookingUrl: string | null;
  imageUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  name: string;
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  year: number | null;
  annualOrOneTime: string | null;
  location: string | null;
  district: string | null;
  description: string | null;
  organizer: string | null;
  officialUrl: string | null;
  imageUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransportRoute {
  id: string;
  origin: string;
  destination: string;
  transportType: string | null;
  approxDistance: number | null;
  approxTime: string | null;
  notes: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}