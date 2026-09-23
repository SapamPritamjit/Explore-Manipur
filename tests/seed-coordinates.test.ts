import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SEED_PATH = join(process.cwd(), "supabase", "seed.sql");

interface VerifiedCoordinate {
  destination: string;
  latitude: number;
  longitude: number;
  sourceUrl: string;
}

// Phase 10 verified set - mirrors the "Verified coordinates (Phase 10)"
// section of DATA_SOURCES.md. The test fails if a destination in seed.sql
// gains a numeric coordinate pair that is not listed here, i.e. coordinates
// that would have no documented, verified source.
const VERIFIED: readonly VerifiedCoordinate[] = [
  {
    destination: "Kangla Fort",
    latitude: 24.808,
    longitude: 93.94,
    sourceUrl: "https://en.wikipedia.org/wiki/Kangla_Fort",
  },
  {
    destination: "Shree Shree Govindajee Temple",
    latitude: 24.797798,
    longitude: 93.948486,
    sourceUrl: "https://en.wikipedia.org/wiki/Shree_Govindajee_Temple",
  },
  {
    destination: "Ima Market (Khwairamband Bazar)",
    latitude: 24.808,
    longitude: 93.935,
    sourceUrl: "https://en.wikipedia.org/wiki/Ima_Keithel",
  },
  {
    destination: "Manipur State Museum",
    latitude: 24.804854,
    longitude: 93.937095,
    sourceUrl: "https://www.wikidata.org/wiki/Q110501212",
  },
  {
    destination: "Imphal War Cemetery",
    latitude: 24.82195,
    longitude: 93.94609,
    sourceUrl:
      "https://www.cwgc.org/visit-us/find-cemeteries-memorials/cemetery-details/2064600/imphal-war-cemetery/",
  },
  {
    destination: "Manipur Zoological Garden",
    latitude: 24.81694,
    longitude: 93.89111,
    sourceUrl: "https://en.wikipedia.org/wiki/Manipur_Zoological_Garden",
  },
  {
    destination: "Loktak Lake",
    latitude: 24.55,
    longitude: 93.783,
    sourceUrl: "https://en.wikipedia.org/wiki/Loktak",
  },
  {
    destination: "Keibul Lamjao National Park",
    latitude: 24.5,
    longitude: 93.76667,
    sourceUrl: "https://en.wikipedia.org/wiki/Keibul_Lamjao_National_Park",
  },
  {
    destination: "Moirang",
    latitude: 24.5,
    longitude: 93.77,
    sourceUrl: "https://en.wikipedia.org/wiki/Moirang",
  },
  {
    destination: "Red Hill (Lokpaching)",
    latitude: 24.703,
    longitude: 93.817,
    sourceUrl: "https://en.wikipedia.org/wiki/Maibam_Lotpa_Ching",
  },
];

// A seed coordinate line is exactly two numeric literals then a comma, e.g.
//    24.808, 93.940,
// Nothing else in the seed file has this shape (distances are single values,
// best_time/distance slots are `null`, `numbers` or strings, never two
// numbers on one line).
const COORD_LINE = /^\s*(\d{1,3}(?:\.\d{1,6})?), (\d{1,3}(?:\.\d{1,6})?),$/;
const DESTINATION_SELECT = /^\s*select '([^']+)',/;

function readSeed(): string {
  return readFileSync(SEED_PATH, "utf8");
}

function seededCoordinatePairs(): { destination: string; latitude: number; longitude: number }[] {
  const pairs: { destination: string; latitude: number; longitude: number }[] = [];
  let current: string | null = null;
  for (const line of readSeed().split(/\r?\n/)) {
    const selectMatch = DESTINATION_SELECT.exec(line);
    if (selectMatch) {
      current = selectMatch[1];
      continue;
    }
    const coordMatch = COORD_LINE.exec(line);
    if (coordMatch) {
      if (current === null) {
        throw new Error(`seed.sql coordinate line without a preceding select: "${line}"`);
      }
      pairs.push({
        destination: current,
        latitude: Number(coordMatch[1]),
        longitude: Number(coordMatch[2]),
      });
    }
  }
  return pairs;
}

describe("seed coordinates (Phase 10)", () => {
  it("keeps every non-NULL destination coordinate inside the verified set", () => {
    const seeded = seededCoordinatePairs();
    const expected = VERIFIED.map((v) => ({
      destination: v.destination,
      latitude: v.latitude,
      longitude: v.longitude,
    }));

    expect(seeded).toEqual(expected);
  });

  it("documents every verified coordinate with its source URL in seed.sql", () => {
    const seed = readSeed();
    for (const verified of VERIFIED) {
      expect(seed).toContain(verified.sourceUrl);
    }
  });

  it("verifies all 20 destinations exist and only 10 carry coordinates", () => {
    const seed = readSeed();
    const insertCount = (seed.match(/insert into public\.destinations \(/g) ?? []).length;
    expect(insertCount).toBe(20);
    expect(seededCoordinatePairs()).toHaveLength(10);
  });
});