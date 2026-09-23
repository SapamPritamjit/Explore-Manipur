import { getBrowserClient } from "@/lib/supabase";
import { throwIfQueryError } from "./errors";
import {
  mapAccommodation,
  mapEvent,
  mapExperience,
  mapFood,
  mapTransport,
} from "./mappers";
import type {
  Accommodation,
  EventItem,
  Experience,
  Food,
  TransportRoute,
} from "./types";
import type {
  AccommodationRow,
  EventRow,
  ExperienceRow,
  FoodRow,
  TransportRow,
} from "./rows";

export async function listFood(): Promise<Food[]> {
  const client = getBrowserClient();
  const { data, error } = await client
    .from("food")
    .select("*")
    .order("name", { ascending: true });
  throwIfQueryError(error, "listFood");
  return (data ?? []).map((row: FoodRow) => mapFood(row));
}

export async function listExperiences(): Promise<Experience[]> {
  const client = getBrowserClient();
  const { data, error } = await client
    .from("experiences")
    .select("*")
    .order("name", { ascending: true });
  throwIfQueryError(error, "listExperiences");
  return (data ?? []).map((row: ExperienceRow) => mapExperience(row));
}

export async function listAccommodation(): Promise<Accommodation[]> {
  const client = getBrowserClient();
  const { data, error } = await client
    .from("accommodation")
    .select("*")
    .order("name", { ascending: true });
  throwIfQueryError(error, "listAccommodation");
  return (data ?? []).map((row: AccommodationRow) => mapAccommodation(row));
}

export async function listEvents(): Promise<EventItem[]> {
  const client = getBrowserClient();
  const { data, error } = await client
    .from("events")
    .select("*")
    .order("name", { ascending: true });
  throwIfQueryError(error, "listEvents");
  return (data ?? []).map((row: EventRow) => mapEvent(row));
}

export async function listTransport(): Promise<TransportRoute[]> {
  const client = getBrowserClient();
  const { data, error } = await client
    .from("transport")
    .select("*")
    .order("origin", { ascending: true })
    .order("destination", { ascending: true });
  throwIfQueryError(error, "listTransport");
  return (data ?? []).map((row: TransportRow) => mapTransport(row));
}

export async function getFood(id: string): Promise<Food | null> {
  const client = getBrowserClient();
  const { data, error } = await client
    .from("food")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfQueryError(error, "getFood");
  return data ? mapFood(data as FoodRow) : null;
}

export async function getExperience(id: string): Promise<Experience | null> {
  const client = getBrowserClient();
  const { data, error } = await client
    .from("experiences")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfQueryError(error, "getExperience");
  return data ? mapExperience(data as ExperienceRow) : null;
}

export async function getAccommodation(id: string): Promise<Accommodation | null> {
  const client = getBrowserClient();
  const { data, error } = await client
    .from("accommodation")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfQueryError(error, "getAccommodation");
  return data ? mapAccommodation(data as AccommodationRow) : null;
}

export async function getEvent(id: string): Promise<EventItem | null> {
  const client = getBrowserClient();
  const { data, error } = await client
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfQueryError(error, "getEvent");
  return data ? mapEvent(data as EventRow) : null;
}