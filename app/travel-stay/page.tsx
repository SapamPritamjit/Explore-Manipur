"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/ui/nav";

type AccommodationItem = {
  id: string;
  name: string;
  location: string | null;
  district: string | null;
  type: string | null;
  priceRange: string | null;
  facilities: string[];
  contact: string | null;
  bookingUrl: string | null;
  imageUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  notes: string | null;
};

type TransportItem = {
  id: string;
  origin: string;
  destination: string;
  transportType: string | null;
  approxDistance: number | null;
  approxTime: string | null;
  notes: string | null;
};

type NearbyPlace = {
  id: string;
  name: string;
  kind: string;
  category: string | null;
  district: string | null;
  distanceKm: number;
  sourceName: string | null;
  sourceUrl: string | null;
};

const ACCOMMODATION_CATEGORIES = [
  { label: "Hotels", icon: "fa-hotel" },
  { label: "Resorts", icon: "fa-tree-city" },
  { label: "Homestays", icon: "fa-house" },
  { label: "Lodges & Guesthouses", icon: "fa-mountain-sun" },
] as const;

function matchesCategory(type: string | null, category: string): boolean {
  if (!type) return false;
  const lower = type.toLowerCase();
  const catLower = category.toLowerCase();
  if (catLower === "lodges & guesthouses") {
    return lower.includes("lodge") || lower.includes("guesthouse");
  }
  return lower.includes(catLower.replace(/s$/, ""));
}

export default function TravelStayPage() {
  const [transport, setTransport] = useState<TransportItem[]>([]);
  const [accommodation, setAccommodation] = useState<AccommodationItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [nearby, setNearby] = useState<NearbyPlace[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "detected" | "denied" | "unsupported">("idle");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [transportRes, accommodationRes] = await Promise.all([
          fetch("/api/explore?type=transport"),
          fetch("/api/explore?type=accommodation"),
        ]);

        if (!transportRes.ok || !accommodationRes.ok) {
          setDataError("Failed to load travel data.");
          return;
        }

        const transportData = await transportRes.json();
        const accommodationData = await accommodationRes.json();

        setTransport(transportData.data ?? []);
        setAccommodation(accommodationData.data ?? []);
      } catch {
        setDataError("Network error while loading travel data.");
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, []);

  function handleUseCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }

    setGeoStatus("loading");
    setNearbyLoading(true);
    setNearbyError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoStatus("detected");
        try {
          const res = await fetch("/api/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              kinds: ["accommodation"],
              radiusKm: 50,
              limitPerKind: 10,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setNearbyError(data?.error?.message ?? "Failed to find nearby stays.");
            return;
          }

          const accGroup = data.groups?.find(
            (g: { kind: string }) => g.kind === "accommodation"
          );
          setNearby(accGroup?.items ?? []);
        } catch {
          setNearbyError("Network error while fetching nearby stays.");
        } finally {
          setNearbyLoading(false);
        }
      },
      () => {
        setGeoStatus("denied");
        setNearbyLoading(false);
      }
    );
  }

  const filteredAccommodation = activeCategory
    ? accommodation.filter((a) => matchesCategory(a.type, activeCategory))
    : accommodation;

  return (
    <div className="nature-page">
      <Nav />

      <section
        className="nature-hero"
        style={{ backgroundImage: 'url("/images/hero.jpeg")' }}
      >
        <div className="nature-hero-content">
          <span>PLAN YOUR JOURNEY</span>
          <h1>Travel & Stay</h1>
          <p>
            Find convenient ways to move around Manipur and accommodation
            options that fit the way you want to experience the state.
          </p>
        </div>
      </section>

      <main className="nature-content">
        <Link href="/#experiences" className="back-link">
          &larr; Back to Experiences
        </Link>

        {dataLoading && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-sm" style={{ color: "#66756c" }}>
              Loading travel information...
            </p>
          </div>
        )}

        {dataError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{dataError}</p>
          </div>
        )}

        {!dataLoading && !dataError && (
          <>
            <div style={{ maxWidth: 720, marginBottom: 55 }}>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#5d8c72",
                  fontWeight: 600,
                }}
              >
                GETTING AROUND MANIPUR
              </span>
              <h2
                style={{
                  marginTop: 10,
                  fontFamily: '"Playfair Display", var(--font-heading), serif',
                  fontSize: 42,
                  fontWeight: 500,
                  lineHeight: 1.1,
                  color: "#173f2b",
                }}
              >
                Choose your way around.
              </h2>
              <p
                style={{
                  color: "#66756c",
                  lineHeight: 1.75,
                  fontSize: 14,
                  marginTop: 18,
                }}
              >
                From flexible private rides to everyday local transport, explore
                the options that can help you move comfortably between Imphal
                and destinations across Manipur.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 22,
                marginBottom: 100,
              }}
            >
              {transport.length === 0 && (
                <>
                  <article
                    style={{
                      background: "#fff",
                      borderRadius: 20,
                      padding: 30,
                      minHeight: 285,
                      border: "1px solid rgba(23,63,43,.07)",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "#edf5ef",
                        color: "#28704e",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 19,
                        marginBottom: 22,
                      }}
                    >
                      &#128663;
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily:
                          '"Playfair Display", var(--font-heading), serif',
                        fontSize: 27,
                        fontWeight: 500,
                        color: "#173f2b",
                      }}
                    >
                      Private Cabs
                    </h3>
                    <p
                      style={{
                        marginTop: 13,
                        color: "#66756c",
                        fontSize: 13,
                        lineHeight: 1.7,
                      }}
                    >
                      A convenient option for airport transfers, sightseeing and
                      longer journeys when you want the flexibility to travel
                      according to your itinerary.
                    </p>
                  </article>
                  <article
                    style={{
                      background: "#fff",
                      borderRadius: 20,
                      padding: 30,
                      minHeight: 285,
                      border: "1px solid rgba(23,63,43,.07)",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "#edf5ef",
                        color: "#28704e",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 19,
                        marginBottom: 22,
                      }}
                    >
                      &#128652;
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily:
                          '"Playfair Display", var(--font-heading), serif',
                        fontSize: 27,
                        fontWeight: 500,
                        color: "#173f2b",
                      }}
                    >
                      Local Auto-Rickshaws
                    </h3>
                    <p
                      style={{
                        marginTop: 13,
                        color: "#66756c",
                        fontSize: 13,
                        lineHeight: 1.7,
                      }}
                    >
                      A practical choice for shorter journeys around Imphal,
                      helping you get between markets, landmarks and
                      neighbourhoods with ease.
                    </p>
                  </article>
                  <article
                    style={{
                      background: "#fff",
                      borderRadius: 20,
                      padding: 30,
                      minHeight: 285,
                      border: "1px solid rgba(23,63,43,.07)",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "#edf5ef",
                        color: "#28704e",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 19,
                        marginBottom: 22,
                      }}
                    >
                      &#128653;
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily:
                          '"Playfair Display", var(--font-heading), serif',
                        fontSize: 27,
                        fontWeight: 500,
                        color: "#173f2b",
                      }}
                    >
                      Bus Connections
                    </h3>
                    <p
                      style={{
                        marginTop: 13,
                        color: "#66756c",
                        fontSize: 13,
                        lineHeight: 1.7,
                      }}
                    >
                      An accessible way to connect Imphal with towns and
                      destinations across the state, making it useful for
                      travellers planning wider journeys.
                    </p>
                  </article>
                </>
              )}

              {transport.map((t) => (
                <article
                  key={t.id}
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: 30,
                    minHeight: 285,
                    border: "1px solid rgba(23,63,43,.07)",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "#edf5ef",
                      color: "#28704e",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 19,
                      marginBottom: 22,
                    }}
                  >
                    &#128652;
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily:
                        '"Playfair Display", var(--font-heading), serif',
                      fontSize: 27,
                      fontWeight: 500,
                      color: "#173f2b",
                    }}
                  >
                    {t.origin} &rarr; {t.destination}
                  </h3>
                  <p
                    style={{
                      marginTop: 13,
                      color: "#66756c",
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    {t.transportType ?? "Transport"}
                    {t.approxDistance != null
                      ? ` · ${t.approxDistance} km`
                      : ""}
                    {t.approxTime != null ? ` · ${t.approxTime}` : ""}
                  </p>
                  {t.notes && (
                    <p
                      style={{
                        marginTop: 8,
                        color: "#66756c",
                        fontSize: 12,
                        lineHeight: 1.6,
                      }}
                    >
                      {t.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>

            <div style={{ marginBottom: 45 }}>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#5d8c72",
                  fontWeight: 600,
                }}
              >
                WHERE TO STAY
              </span>
              <h2
                style={{
                  marginTop: 10,
                  fontFamily: '"Playfair Display", var(--font-heading), serif',
                  fontSize: 42,
                  fontWeight: 500,
                  lineHeight: 1.1,
                  color: "#173f2b",
                }}
              >
                Accommodation for every journey.
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
                marginBottom: 18,
              }}
            >
              {ACCOMMODATION_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() =>
                      setActiveCategory(isActive ? null : cat.label)
                    }
                    style={{
                      minHeight: 86,
                      padding: "18px 14px",
                      background: isActive ? "#edf5ef" : "#fff",
                      border: "1px solid rgba(23,63,43,.07)",
                      borderRadius: 16,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 9,
                      color: isActive ? "#173f2b" : "#557362",
                      fontSize: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      transition:
                        "transform .25s ease, background .25s ease, color .25s ease",
                    }}
                  >
                    <span style={{ color: "#28704e", fontSize: 17 }}>
                      {cat.icon === "fa-hotel" && "\u{1F3E8}"}
                      {cat.icon === "fa-tree-city" && "\u{1F333}"}
                      {cat.icon === "fa-house" && "\u{1F3E0}"}
                      {cat.icon === "fa-mountain-sun" && "\u{26F0}\uFE0F"}
                    </span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <p
              style={{
                maxWidth: 650,
                margin: "14px 0 28px",
                color: "#66756c",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              Showing {filteredAccommodation.length} accommodation option
              {filteredAccommodation.length !== 1 ? "s" : ""}
              {activeCategory ? ` in ${activeCategory}` : ""}.
            </p>

            <div style={{ display: "grid", gap: 24, marginBottom: 100 }}>
              {filteredAccommodation.length === 0 && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 22,
                    padding: 40,
                    border: "1px solid rgba(23,63,43,.07)",
                    textAlign: "center",
                  }}
                >
                  <p style={{ color: "#66756c", fontSize: 14 }}>
                    No accommodation found in this category.
                  </p>
                </div>
              )}

              {filteredAccommodation.map((acc) => (
                <article
                  key={acc.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "280px 1fr auto",
                    gap: 30,
                    alignItems: "center",
                    background: "#fff",
                    borderRadius: 22,
                    padding: 18,
                    border: "1px solid rgba(23,63,43,.07)",
                  }}
                  className="stay-card-responsive"
                >
                  <div
                    style={{
                      height: 190,
                      overflow: "hidden",
                      borderRadius: 16,
                      background: "#e8eee9",
                    }}
                  >
                    {acc.imageUrl ? (
                      <img
                        src={acc.imageUrl}
                        alt={acc.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          color: "#5d8c72",
                          fontSize: 32,
                        }}
                      >
                        {"\u{1F3E8}"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily:
                          '"Playfair Display", var(--font-heading), serif',
                        fontSize: 29,
                        fontWeight: 500,
                        color: "#173f2b",
                      }}
                    >
                      {acc.name}
                    </h3>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 7,
                        fontSize: 10,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        color: "#5d8c72",
                        fontWeight: 600,
                      }}
                    >
                      {acc.type ?? "Accommodation"}
                      {acc.district ? ` · ${acc.district}` : ""}
                    </span>
                    {acc.notes && (
                      <p
                        style={{
                          color: "#66756c",
                          fontSize: 13,
                          lineHeight: 1.7,
                          maxWidth: 580,
                          margin: "14px 0 0",
                        }}
                      >
                        {acc.notes}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginTop: 15,
                      }}
                    >
                      {acc.location && (
                        <span
                          style={{
                            background: "#edf5ef",
                            color: "#466553",
                            padding: "7px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                          }}
                        >
                          {acc.location}
                        </span>
                      )}
                      {acc.priceRange && (
                        <span
                          style={{
                            background: "#edf5ef",
                            color: "#466553",
                            padding: "7px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                          }}
                        >
                          {acc.priceRange}
                        </span>
                      )}
                      {acc.facilities.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          style={{
                            background: "#edf5ef",
                            color: "#466553",
                            padding: "7px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  {acc.bookingUrl && (
                    <a
                      href={acc.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        whiteSpace: "nowrap",
                        textDecoration: "none",
                        color: "#fff",
                        background: "#173f2b",
                        borderRadius: 999,
                        padding: "12px 18px",
                        fontSize: 12,
                      }}
                    >
                      View Details
                    </a>
                  )}
                </article>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#5d8c72",
                  fontWeight: 600,
                }}
              >
                CURATED FOR YOUR STAY
              </span>
              <h3
                style={{
                  margin: "8px 0 0",
                  fontFamily: '"Playfair Display", var(--font-heading), serif',
                  fontSize: 30,
                  fontWeight: 500,
                  color: "#173f2b",
                }}
              >
                Recommended for you
              </h3>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#66756c",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                Nearby accommodation based on your current location.
              </p>
            </div>

            <div style={{ marginBottom: 40 }}>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoStatus === "loading" || nearbyLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#173f2b",
                  color: "#fff",
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    geoStatus === "loading" || nearbyLoading
                      ? "wait"
                      : "pointer",
                  opacity:
                    geoStatus === "loading" || nearbyLoading ? 0.7 : 1,
                }}
              >
                {geoStatus === "loading" || nearbyLoading
                  ? "Detecting location..."
                  : "Use my current location"}
              </button>

              {geoStatus === "detected" && !nearbyLoading && (
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#28704e",
                  }}
                >
                  Location detected. Showing nearby stays.
                </p>
              )}

              {geoStatus === "denied" && (
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#b45309",
                  }}
                >
                  Location permission denied. Nearby recommendations require
                  location access. You can still browse all accommodation
                  above.
                </p>
              )}

              {geoStatus === "unsupported" && (
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#b45309",
                  }}
                >
                  Geolocation is not supported by your browser. You can still
                  browse all accommodation above.
                </p>
              )}

              {nearbyError && (
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#dc2626",
                  }}
                >
                  {nearbyError}
                </p>
              )}
            </div>

            {nearbyLoading && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 22,
                  padding: 40,
                  border: "1px solid rgba(23,63,43,.07)",
                  textAlign: "center",
                  marginBottom: 40,
                }}
              >
                <p style={{ color: "#66756c", fontSize: 14 }}>
                  Finding nearby accommodation...
                </p>
              </div>
            )}

            {!nearbyLoading && geoStatus === "detected" && nearby.length === 0 && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 22,
                  padding: 40,
                  border: "1px solid rgba(23,63,43,.07)",
                  textAlign: "center",
                  marginBottom: 40,
                }}
              >
                <p style={{ color: "#66756c", fontSize: 14 }}>
                  No nearby accommodation found within the search radius.
                </p>
              </div>
            )}

            {!nearbyLoading && nearby.length > 0 && (
              <div style={{ display: "grid", gap: 24, marginBottom: 40 }}>
                {nearby.map((place) => (
                  <article
                    key={place.id}
                    style={{
                      background: "#fff",
                      borderRadius: 22,
                      padding: "24px 30px",
                      border: "1px solid rgba(23,63,43,.07)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 20,
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontFamily:
                            '"Playfair Display", var(--font-heading), serif',
                          fontSize: 22,
                          fontWeight: 500,
                          color: "#173f2b",
                        }}
                      >
                        {place.name}
                      </h4>
                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#66756c",
                          fontSize: 13,
                        }}
                      >
                        {place.category ?? "Accommodation"}
                        {place.district ? ` · ${place.district}` : ""}
                        {" · "}
                        {place.distanceKm.toFixed(1)} km away (estimated)
                      </p>
                    </div>
                    {place.sourceUrl && (
                      <a
                        href={place.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          whiteSpace: "nowrap",
                          textDecoration: "none",
                          color: "#fff",
                          background: "#173f2b",
                          borderRadius: 999,
                          padding: "10px 16px",
                          fontSize: 12,
                        }}
                      >
                        View Details
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-mark">M</span>
              Explore Manipur
            </div>
            <p>Discover. Experience. Remember.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Explore</h4>
              <Link href="/#destinations">Destinations</Link>
              <Link href="/#experiences">Experiences</Link>
              <Link href="/#map">Map</Link>
            </div>
            <div>
              <h4>Plan</h4>
              <Link href="/plan-trip">Plan a Trip</Link>
              <Link href="/travel-stay">Travel & Stay</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Explore Manipur</span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 800px) {
          .stay-card-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
