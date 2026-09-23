"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/ui/nav";
import { useTripStore } from "@/store/trip";

export default function RecommendationsPage() {
  const router = useRouter();
  const tripPlan = useTripStore((s) => s.tripPlan);
  const selectedIds = useTripStore((s) => s.selectedDestinationIds);
  const toggleDestination = useTripStore((s) => s.toggleDestination);

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
            <span>RECOMMENDATIONS</span>
            <h1>Your Picks</h1>
            <p>
              Plan your trip first to see personalized recommendations.
            </p>
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
            Plan your trip first to see personalized recommendations.
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

  const recommendations = Array.isArray(tripPlan?.recommendations) ? tripPlan.recommendations : [];

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
          <span>RECOMMENDATIONS</span>
          <h1>Your personalized picks</h1>
          <p>
            Select the destinations you want to visit. We will build your
            itinerary from your choices.
          </p>
        </div>
      </section>

      <main className="nature-content">
        <Link href="/plan-trip" className="back-link">
          ← Back to Plan
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
            RECOMMENDATIONS
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
            Your personalized picks.
          </h2>
          <p
            style={{
              color: "#66756c",
              lineHeight: 1.75,
              fontSize: 14,
              marginTop: 18,
              maxWidth: 700,
            }}
          >
            Based on your preferences, here are destinations we recommend.
            Select the ones you want to include in your trip.
          </p>
        </div>

        {recommendations.length === 0 && (
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
              No recommendations matched your preferences. Try adjusting your
              interests or budget.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gap: 24, marginBottom: 60 }}>
          {recommendations.map((rec) => {
            const isSelected = selectedIds.includes(rec.candidate.id);
            return (
              <article
                key={rec.candidate.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "280px 1fr auto",
                  gap: 30,
                  alignItems: "center",
                  background: isSelected ? "#edf5ef" : "#fff",
                  borderRadius: 22,
                  padding: 18,
                  border: isSelected
                    ? "2px solid #28704e"
                    : "1px solid rgba(23,63,43,.07)",
                  transition: "border-color .25s ease, background .25s ease",
                }}
                className="discover-card-responsive"
              >
                <div
                  style={{
                    height: 190,
                    overflow: "hidden",
                    borderRadius: 16,
                    background: "#e8eee9",
                  }}
                >
                  {rec.candidate.imageUrl ? (
                    <img
                      src={rec.candidate.imageUrl}
                      alt={rec.candidate.name}
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
                      ⊕
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
                    {rec.candidate.name}
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
                    {rec.candidate.category}
                    {(Array.isArray(rec.candidate?.tags) ? rec.candidate.tags : []).length > 0
                      ? ` · ${(rec.candidate?.tags ?? []).slice(0, 3).join(", ")}`
                      : ""}
                  </span>
                  {rec.candidate.description && (
                    <p
                      style={{
                        color: "#66756c",
                        fontSize: 13,
                        lineHeight: 1.7,
                        maxWidth: 580,
                        margin: "14px 0 0",
                      }}
                    >
                      {rec.candidate.description}
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
                    <span
                      style={{
                        background: isSelected ? "#dcefe3" : "#edf5ef",
                        color: "#466553",
                        padding: "7px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                      }}
                    >
                      Score: {Math.round(rec.score * 100)}%
                    </span>
                    {(rec.matchedInterests ?? []).map((interest) => (
                      <span
                        key={interest}
                        style={{
                          background: "#edf5ef",
                          color: "#466553",
                          padding: "7px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>

                  {(Array.isArray(rec.explanation) ? rec.explanation.length > 0 : !!rec.explanation) && (
                    <p
                      style={{
                        color: "#789084",
                        fontSize: 12,
                        lineHeight: 1.6,
                        marginTop: 10,
                        fontStyle: "italic",
                      }}
                    >
                      {Array.isArray(rec.explanation) ? rec.explanation.join(" ") : rec.explanation}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggleDestination(rec.candidate.id)}
                  style={{
                    whiteSpace: "nowrap",
                    color: isSelected ? "#fff" : "#fff",
                    background: isSelected ? "#28704e" : "#173f2b",
                    borderRadius: 999,
                    padding: "12px 18px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    transition: "background .25s ease",
                  }}
                >
                  {isSelected ? "Selected ✓" : "Select"}
                </button>
              </article>
            );
          })}
        </div>

        {selectedIds.length > 0 && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p
              style={{
                color: "#5d8c72",
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              {selectedIds.length} destination
              {selectedIds.length !== 1 ? "s" : ""} selected
            </p>
            <button
              type="button"
              onClick={() => router.push("/trip")}
              className="primary-button"
              style={{ cursor: "pointer", border: "none" }}
            >
              View My Trip →
            </button>
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

      <style>{`
        @media (max-width: 800px) {
          .discover-card-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
