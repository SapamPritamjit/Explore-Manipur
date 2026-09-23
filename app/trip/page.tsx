"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/ui/nav";
import { useTripStore } from "@/store/trip";

type DailyForecast = {
  date: string;
  condition: { code: number; label: string; category: string; outdoorSuitable: boolean };
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitationProbabilityMax: number | null;
};

type WeatherPoint = {
  id: string | null;
  name: string;
  status: string;
  forecast: DailyForecast[];
  error: string | null;
};

type WeatherWarning = { code: string; message: string };

type WeatherData = {
  points: WeatherPoint[];
  warnings: WeatherWarning[];
};

export default function TripPage() {
  const router = useRouter();
  const tripPlan = useTripStore((s) => s.tripPlan);
  const selectedIds = useTripStore((s) => s.selectedDestinationIds);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

    const weatherDestIds = useMemo(
    () =>
      tripPlan
        ? Array.from(
            new Set(
              (tripPlan.itinerary as { days?: Array<{ stops: Array<{ destination: { id: string } }> }> }).days?.flatMap(
                (d: { stops: Array<{ destination: { id: string } }> }) =>
                  d.stops.map((s: { destination: { id: string } }) => s.destination.id)
              ) ?? []
            )
          ).filter((id: string) => {
            const rec = tripPlan.recommendations.find((r) => r.candidate.id === id);
            const lat = rec?.candidate.latitude ?? (rec?.candidate as Record<string, unknown>)?.coordinates != null ? (rec?.candidate as unknown as { coordinates: { latitude: number | null } }).coordinates.latitude : null;
            const lng = rec?.candidate.longitude ?? (rec?.candidate as Record<string, unknown>)?.coordinates != null ? (rec?.candidate as unknown as { coordinates: { longitude: number | null } }).coordinates.longitude : null;
            return lat != null && lng != null;
          })
        : [],
    [tripPlan]
  );

  const weatherKey = weatherDestIds.join(",");

  useEffect(() => {
    if (!weatherKey) return;
    let cancelled = false;
    async function loadWeather() {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const res = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationIds: weatherDestIds, days: 3 }),
        });
        if (!res.ok) throw new Error("Weather request failed");
        const data = await res.json();
        if (!cancelled) {
          setWeatherData(data as WeatherData);
          setWeatherLoading(false);
        }
      } catch {
        if (!cancelled) {
          setWeatherError("Unable to load weather information.");
          setWeatherLoading(false);
        }
      }
    }
    loadWeather();
    return () => {
      cancelled = true;
    };
  }, [weatherKey, weatherDestIds]);

  if (!tripPlan) {
    return (
      <div className="nature-page">
        <Nav />
        <section
          className="nature-hero"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(10,35,25,0.82), rgba(10,35,25,0.12)), url("/images/hero.jpeg")',
          }}
        >
          <div className="nature-hero-content">
            <span>MY TRIP</span>
            <h1>Your Itinerary</h1>
            <p>Plan your trip first to see a day-by-day itinerary.</p>
          </div>
        </section>
        <main
          className="nature-content"
          style={{
            textAlign: "center",
            minHeight: "40vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 36,
              fontWeight: 500,
              color: "#173f2b",
              marginBottom: 16,
            }}
          >
            No trip planned yet
          </h2>
          <p
            style={{
              color: "#66756c",
              fontSize: 15,
              maxWidth: 500,
              marginBottom: 30,
            }}
          >
            Start by planning your trip to get personalized recommendations and
            an itinerary.
          </p>
          <Link href="/plan-trip" className="primary-button">
            Plan My Trip →
          </Link>
        </main>
        <footer className="site-footer">
          <div className="footer-bottom">
            <span>© 2026 Explore Manipur</span>
          </div>
        </footer>
      </div>
    );
  }

  if (selectedIds.length === 0) {
    return (
      <div className="nature-page">
        <Nav />
        <section
          className="nature-hero"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(10,35,25,0.82), rgba(10,35,25,0.12)), url("/images/hero.jpeg")',
          }}
        >
          <div className="nature-hero-content">
            <span>MY TRIP</span>
            <h1>Your Itinerary</h1>
            <p>Select destinations on the Recommendations page to build your trip.</p>
          </div>
        </section>
        <main
          className="nature-content"
          style={{
            textAlign: "center",
            minHeight: "40vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 36,
              fontWeight: 500,
              color: "#173f2b",
              marginBottom: 16,
            }}
          >
            No destinations selected
          </h2>
          <p
            style={{
              color: "#66756c",
              fontSize: 15,
              maxWidth: 500,
              marginBottom: 30,
            }}
          >
            Go to Recommendations to select the places you want to visit. Your
            day-by-day itinerary will appear here.
          </p>
          <Link href="/recommendations" className="primary-button">
            View Recommendations →
          </Link>
        </main>
        <footer className="site-footer">
          <div className="footer-bottom">
            <span>© 2026 Explore Manipur</span>
          </div>
        </footer>
      </div>
    );
  }

  const itinerary = tripPlan.itinerary as {
    requestedDays?: number;
    usedDays?: number;
    dailyAvailableHours?: number;
    totalStops?: number;
    days?: Array<{
      dayNumber: number;
      stops: Array<{
        destination: { id: string; name: string; category: string };
        visitHours: number | null;
        estimatedCost: number | null;
        costKnown: boolean;
      }>;
      travelSegments: Array<{
        from: string;
        to: string;
        distanceKm: number | null;
        travelTime: string | null;
        travelTimeUnknown: boolean;
      }>;
      availableHours: number;
      scheduledHours: number;
      overCapacity: boolean;
      cost: { knownSubtotal: number; unknownCount: number };
    }>;
    cost?: {
      knownSubtotal: number;
      unknownCount: number;
      estimatedTotal: number | null;
      budgetStatus: string;
    };
    warnings?: Array<{ code: string; message: string }>;
  };

  const selectedRecs = tripPlan.recommendations.filter((r) =>
    selectedIds.includes(r.candidate.id)
  );

  const rawDays = itinerary.days ?? [];
  const days = rawDays.map((day) => ({
    ...day,
    stops: day.stops.filter((stop) => selectedIds.includes(stop.destination.id)),
    travelSegments: day.travelSegments.filter((seg) =>
      selectedIds.some((id) => {
        const rec = tripPlan.recommendations.find((r) => r.candidate.id === id);
        return rec && (seg.to === rec.candidate.name || seg.from === rec.candidate.name);
      })
    ),
  })).filter((day) => day.stops.length > 0).map((day, i) => ({
    ...day,
    dayNumber: i + 1,
    scheduledHours: day.stops.reduce((sum, s) => sum + (s.visitHours ?? 8), 0),
    cost: {
      knownSubtotal: day.stops.reduce((sum, s) => sum + (s.costKnown ? (s.estimatedCost ?? 0) : 0), 0),
      unknownCount: day.stops.filter((s) => !s.costKnown).length,
    },
    overCapacity: day.stops.reduce((sum, s) => sum + (s.visitHours ?? 8), 0) > day.availableHours,
  }));
  const costSummary = {
    ...itinerary.cost,
    knownSubtotal: days.reduce((sum, d) => sum + d.cost.knownSubtotal, 0),
    unknownCount: days.reduce((sum, d) => sum + d.cost.unknownCount, 0),
    estimatedTotal: days.reduce((sum, d) => sum + d.cost.unknownCount, 0) === 0
      ? days.reduce((sum, d) => sum + d.cost.knownSubtotal, 0)
      : null,
  };
  const warnings = itinerary.warnings ?? [];

  const itineraryDestinationIds = days.flatMap((day) =>
    day.stops.map((stop) => stop.destination.id)
  );
  const uniqueItineraryIds = Array.from(new Set(itineraryDestinationIds));
  const recMap = new Map(
    tripPlan.recommendations.map((r) => [r.candidate.id, r.candidate])
  );
  const idsWithCoords = uniqueItineraryIds.filter((id) => {
    const candidate = recMap.get(id);
    const lat = candidate?.latitude ?? (candidate as unknown as { coordinates?: { latitude: number | null } })?.coordinates?.latitude;
    const lng = candidate?.longitude ?? (candidate as unknown as { coordinates?: { longitude: number | null } })?.coordinates?.longitude;
    return lat != null && lng != null;
  });
  const hasMappableDestinations = idsWithCoords.length > 0;
  const missingCoordsCount = uniqueItineraryIds.length - idsWithCoords.length;

  const handleViewOnMap = () => {
    router.push(`/map?itinerary=${uniqueItineraryIds.join(",")}`);
  };

  return (
    <div className="nature-page">
      <Nav />
      <section
        className="nature-hero"
        style={{
          backgroundImage:
            'linear-gradient(to top, rgba(10,35,25,0.82), rgba(10,35,25,0.12)), url("/images/hero.jpeg")',
        }}
      >
        <div className="nature-hero-content">
          <span>MY TRIP</span>
          <h1>Your Itinerary</h1>
          <p>
            {days.length} day
            {days.length !== 1
              ? "s"
              : ""}{" "}
            · {selectedIds.length} destination
            {selectedIds.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <main className="nature-content">
        <Link href="/recommendations" className="back-link">
          ← Back to Recommendations
        </Link>

        <div style={{ marginBottom: 45 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "#5d8c72",
              fontWeight: 600,
            }}
          >
            YOUR PICKS
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
            Selected destinations.
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
           {selectedRecs.map((rec) => (
            <div
              key={rec.candidate.id}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "14px 20px",
                border: "1px solid rgba(23,63,43,.07)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: 18,
                  fontWeight: 500,
                  color: "#173f2b",
                }}
              >
                {rec.candidate.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "#5d8c72",
                  fontWeight: 600,
                }}
              >
                {rec.candidate.category}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 50,
          }}
        >
          {hasMappableDestinations ? (
            <>
              <button
                type="button"
                onClick={handleViewOnMap}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  background: "#28704e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "background .2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1e5238")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#28704e")}
              >
                Start Trip →
              </button>
              <button
                type="button"
                onClick={handleViewOnMap}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  background: "transparent",
                  color: "#28704e",
                  border: "2px solid #28704e",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "background .2s ease, color .2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#edf5ef";
                  e.currentTarget.style.color = "#173f2b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#28704e";
                }}
              >
                Explore on Map
              </button>
              {missingCoordsCount > 0 && (
                <p style={{ margin: 0, fontSize: 12, color: "#66756c", width: "100%" }}>
                  {missingCoordsCount} destination{missingCoordsCount !== 1 ? "s" : ""} without verified coordinates will not appear on the map.
                </p>
              )}
            </>
          ) : uniqueItineraryIds.length > 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: "#66756c" }}>
              Map unavailable — none of your itinerary destinations have verified coordinates yet.
            </p>
          ) : null}
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
            DAY-BY-DAY ITINERARY
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
            Your schedule.
          </h2>
        </div>

        {days.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: 40,
              border: "1px solid rgba(23,63,43,.07)",
              textAlign: "center",
              marginBottom: 60,
            }}
          >
            <p style={{ color: "#66756c", fontSize: 14 }}>
              No itinerary days were generated. Try selecting fewer destinations
              or increasing your trip duration.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gap: 30, marginBottom: 60 }}>
          {days.map((day) => (
            <div
              key={day.dayNumber}
              style={{
                background: "#fff",
                borderRadius: 22,
                padding: 30,
                border: day.overCapacity
                  ? "1px solid rgba(180,83,9,.3)"
                  : "1px solid rgba(23,63,43,.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 24,
                    fontWeight: 500,
                    color: "#173f2b",
                  }}
                >
                  Day {day.dayNumber}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    color: "#66756c",
                  }}
                >
                  {Math.round(day.scheduledHours * 10) / 10}h /{" "}
                  {day.availableHours}h available
                  {day.overCapacity && (
                    <span style={{ color: "#b45309", marginLeft: 8 }}>
                      Over capacity
                    </span>
                  )}
                </span>
              </div>

              {day.travelSegments.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {day.travelSegments.map((seg, i) => (
                    <div
                      key={i}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#edf5ef",
                        borderRadius: 999,
                        padding: "6px 12px",
                        fontSize: 11,
                        color: "#466553",
                        marginRight: 8,
                        marginBottom: 6,
                      }}
                    >
                      {seg.from} → {seg.to}
                      {seg.distanceKm != null && ` · ${seg.distanceKm} km`}
                      {seg.travelTime != null && ` · ${seg.travelTime}`}
                      {seg.travelTimeUnknown && " · travel time estimated"}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "grid", gap: 12 }}>
                {day.stops.map((stop) => (
                  <div
                    key={stop.destination.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 18px",
                      background: "#f8faf8",
                      borderRadius: 14,
                      border: "1px solid rgba(23,63,43,.05)",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: '"Playfair Display", serif',
                          fontSize: 17,
                          fontWeight: 500,
                          color: "#173f2b",
                        }}
                      >
                        {stop.destination.name}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 10,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          color: "#5d8c72",
                          fontWeight: 600,
                          marginTop: 4,
                        }}
                      >
                        {stop.destination.category}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      {stop.visitHours != null && (
                        <span
                          style={{
                            background: "#edf5ef",
                            color: "#466553",
                            padding: "5px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                          }}
                        >
                          {stop.visitHours}h
                        </span>
                      )}
                      {stop.estimatedCost != null && (
                        <span
                          style={{
                            background: "#edf5ef",
                            color: "#466553",
                            padding: "5px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                          }}
                        >
                          ₹{stop.estimatedCost}
                        </span>
                      )}
                      {!stop.costKnown && (
                        <span
                          style={{
                            background: "#fef3c7",
                            color: "#92400e",
                            padding: "5px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                          }}
                        >
                          Cost unknown
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(() => {
                const dayStopNames = day.stops.map((s) => s.destination.name);
                const dayWeatherPoints = weatherData
                  ? weatherData.points.filter(
                      (p) => p.status === "ok" && p.forecast.length > 0 && dayStopNames.includes(p.name)
                    )
                  : [];
                const hasDayWeather = weatherLoading || weatherError || dayWeatherPoints.length > 0;
                if (!hasDayWeather && !weatherLoading && !weatherError) return null;
                return (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid rgba(23,63,43,.06)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        color: "#5d8c72",
                        fontWeight: 600,
                      }}
                    >
                      Weather Outlook
                    </span>
                    {weatherLoading && (
                      <p style={{ color: "#66756c", fontSize: 13, marginTop: 8 }}>
                        Loading weather forecast...
                      </p>
                    )}
                    {weatherError && (
                      <p style={{ color: "#b45309", fontSize: 13, marginTop: 8 }}>{weatherError}</p>
                    )}
                    {!weatherLoading && !weatherError && dayWeatherPoints.length > 0 && (
                      <div style={{ display: "grid", gap: 12, marginTop: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                        {dayWeatherPoints.map((point) => (
                          <div
                            key={point.id ?? point.name}
                            style={{
                              background: "#f8faf8",
                              borderRadius: 12,
                              padding: 14,
                              border: "1px solid rgba(23,63,43,.06)",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 8px",
                                fontFamily: '"Playfair Display", serif',
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#173f2b",
                              }}
                            >
                              {point.name}
                            </h4>
                            <div style={{ display: "grid", gap: 6 }}>
                              {point.forecast.slice(0, 3).map((fc) => (
                                <div
                                  key={fc.date}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "4px 0",
                                    borderBottom: "1px solid rgba(23,63,43,.04)",
                                  }}
                                >
                                  <span style={{ fontSize: 11, color: "#66756c", minWidth: 44 }}>
                                    {fc.date.slice(5)}
                                  </span>
                                  <span
                                    style={{
                                      background:
                                        fc.condition.category === "good"
                                          ? "#dcefe3"
                                          : fc.condition.category === "adverse"
                                            ? "#fee2e2"
                                            : "#fef3c7",
                                      color:
                                        fc.condition.category === "good"
                                          ? "#166534"
                                          : fc.condition.category === "adverse"
                                            ? "#991b1b"
                                            : "#92400e",
                                      padding: "2px 8px",
                                      borderRadius: 999,
                                      fontSize: 10,
                                      flex: 1,
                                    }}
                                  >
                                    {fc.condition.label}
                                  </span>
                                  {fc.temperatureMax != null && (
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#173f2b", minWidth: 28, textAlign: "right" }}>
                                      {Math.round(fc.temperatureMax)}°
                                    </span>
                                  )}
                                  {fc.temperatureMin != null && (
                                    <span style={{ fontSize: 11, color: "#66756c", minWidth: 28, textAlign: "right" }}>
                                      {Math.round(fc.temperatureMin)}°
                                    </span>
                                  )}
                                  {fc.precipitationProbabilityMax != null && fc.precipitationProbabilityMax > 0 && (
                                    <span style={{ fontSize: 10, color: "#66756c", minWidth: 30, textAlign: "right" }}>
                                      {fc.precipitationProbabilityMax}%
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!weatherLoading && !weatherError && dayWeatherPoints.length === 0 && weatherData && (
                      <p style={{ color: "#66756c", fontSize: 12, marginTop: 8 }}>
                        Weather unavailable for this day&apos;s destinations.
                      </p>
                    )}
                  </div>
                );
              })()}

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(23,63,43,.06)",
                  fontSize: 12,
                  color: "#66756c",
                }}
              >
                Day subtotal: ₹{day.cost.knownSubtotal}
                {day.cost.unknownCount > 0 &&
                  ` + ${day.cost.unknownCount} unknown cost${day.cost.unknownCount > 1 ? "s" : ""}`}
              </div>
            </div>
          ))}
        </div>

        {weatherData && weatherData.warnings.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: 24,
              border: "1px solid rgba(23,63,43,.07)",
              marginBottom: 40,
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: "#66756c" }}>
              {weatherData.warnings.map((w: WeatherWarning) => w.message).join(" ")}
            </p>
          </div>
        )}

        {costSummary && (
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: 30,
              border: "1px solid rgba(23,63,43,.07)",
              marginBottom: 40,
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontFamily: '"Playfair Display", serif',
                fontSize: 24,
                fontWeight: 500,
                color: "#173f2b",
              }}
            >
              Cost Summary
            </h3>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#4a5a50" }}>Known total</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#173f2b" }}>₹{costSummary.knownSubtotal}</span>
              </div>
              {costSummary.estimatedTotal != null && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: "#4a5a50" }}>Estimated total</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#173f2b" }}>₹{costSummary.estimatedTotal}</span>
                </div>
              )}
              {costSummary.unknownCount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: "#4a5a50" }}>Unknown costs</span>
                  <span
                    style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {costSummary.unknownCount} destination{costSummary.unknownCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#4a5a50" }}>Budget</span>
                <span
                  style={{
                    background:
                      costSummary.budgetStatus === "within-budget"
                        ? "#dcefe3"
                        : costSummary.budgetStatus === "exceeds-budget"
                          ? "#fee2e2"
                          : "#edf5ef",
                    color:
                      costSummary.budgetStatus === "within-budget"
                        ? "#166534"
                        : costSummary.budgetStatus === "exceeds-budget"
                          ? "#991b1b"
                          : "#466553",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {costSummary.budgetStatus === "no-budget" ? "Not specified" : (costSummary.budgetStatus ?? "").replace(/-/g, " ") || "Not specified"}
                </span>
              </div>
            </div>
          </div>
        )}

        {weatherDestIds.length === 0 && uniqueItineraryIds.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: 24,
              border: "1px solid rgba(23,63,43,.07)",
              marginBottom: 40,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#66756c" }}>
              Weather unavailable — none of your itinerary destinations have verified coordinates for weather lookup.
            </p>
          </div>
        )}

        {warnings.length > 0 && (
          <div
            style={{
              background: "#fffbeb",
              borderRadius: 22,
              padding: 24,
              border: "1px solid rgba(180,83,9,.15)",
              marginBottom: 40,
            }}
          >
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: 13,
                fontWeight: 600,
                color: "#92400e",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Notices
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {warnings.map((w, i) => (
                <li
                  key={i}
                  style={{
                    color: "#78350f",
                    fontSize: 13,
                    lineHeight: 1.7,
                    marginBottom: 6,
                  }}
                >
                  {w.message}
                </li>
              ))}
            </ul>
          </div>
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
          <span>© 2026 Explore Manipur</span>
        </div>
      </footer>
    </div>
  );
}
