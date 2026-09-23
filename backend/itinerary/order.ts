import { haversineKm } from "../recommendation";
import type { Coordinates, TourismCandidate } from "../recommendation";

export function hasValidCoordinates(
  coordinates?: Coordinates | null
): coordinates is Coordinates {
  return (
    !!coordinates &&
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude)
  );
}

type GeoTourismCandidate = TourismCandidate & { coordinates: Coordinates };

function hasCoordinates(
  destination: TourismCandidate
): destination is GeoTourismCandidate {
  return hasValidCoordinates(destination.coordinates);
}

export function orderDestinations(
  start: { label: string; coordinates?: Coordinates | null } | null | undefined,
  destinations: readonly TourismCandidate[]
): TourismCandidate[] {
  const startCoordinates = hasValidCoordinates(start?.coordinates)
    ? start.coordinates
    : null;

  if (startCoordinates) {
    const withCoordinates = destinations.filter(hasCoordinates);

    if (withCoordinates.length > 0) {
      const remaining = [...withCoordinates];
      const ordered: TourismCandidate[] = [];
      let cursor: Coordinates = startCoordinates;

      while (remaining.length > 0) {
        let bestIndex = 0;
        let bestDistance = Infinity;
        for (let i = 0; i < remaining.length; i++) {
          const distance = haversineKm(cursor, remaining[i].coordinates);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
          }
        }
        const next = remaining.splice(bestIndex, 1)[0];
        ordered.push(next);
        cursor = next.coordinates;
      }

      const withoutCoordinates = destinations.filter(
        (destination) => !hasCoordinates(destination)
      );

      return [...ordered, ...withoutCoordinates];
    }
  }

  return [...destinations];
}