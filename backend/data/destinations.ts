import { getBrowserClient } from "@/lib/supabase";
import type { TourismCandidate } from "@/backend/recommendation";
import { throwIfQueryError } from "./errors";
import { mapDestination, toTourismCandidates } from "./mappers";
import type { Destination, DestinationFilters } from "./types";
import type { DestinationRow } from "./rows";

function trimmed(value: string | undefined): string | null {
  const result = (value ?? "").trim();
  return result.length > 0 ? result : null;
}

export async function listDestinations(
  filters: DestinationFilters = {}
): Promise<Destination[]> {
  const client = getBrowserClient();
  let query = client.from("destinations").select("*");

  const district = trimmed(filters.district);
  if (district) {
    query = query.eq("district", district);
  }

  const category = trimmed(filters.category);
  if (category) {
    query = query.eq("category", category);
  }

  const interests = (filters.interests ?? [])
    .map((interest) => interest.trim())
    .filter(Boolean);
  if (interests.length > 0) {
    query = query.overlaps("tags", interests);
  }

  query = query.order("name", { ascending: true });

  const { data, error } = await query;
  throwIfQueryError(error, "listDestinations");

  return (data ?? []).map((row: DestinationRow) => mapDestination(row));
}

export async function getDestination(id: string): Promise<Destination | null> {
  const client = getBrowserClient();
  const { data, error } = await client
    .from("destinations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfQueryError(error, "getDestination");

  return data ? mapDestination(data as DestinationRow) : null;
}

export async function listDestinationCandidates(
  filters: DestinationFilters = {}
): Promise<TourismCandidate[]> {
  const destinations = await listDestinations(filters);
  return toTourismCandidates(destinations);
}