"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/ui/nav";

type ExploreItem = {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  district?: string | null;
  tags?: string[] | null;
  cuisine?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export default function DiscoverPage() {
  const [destinations, setDestinations] = useState<ExploreItem[]>([]);
  const [food, setFood] = useState<ExploreItem[]>([]);
  const [experiences, setExperiences] = useState<ExploreItem[]>([]);
  const [events, setEvents] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [destRes, foodRes, expRes, evtRes] = await Promise.all([
          fetch("/api/explore?type=destinations"),
          fetch("/api/explore?type=food"),
          fetch("/api/explore?type=experiences"),
          fetch("/api/explore?type=events"),
        ]);
        if (!cancelled) {
          const destData = destRes.ok ? await destRes.json() : null;
          const foodData = foodRes.ok ? await foodRes.json() : null;
          const expData = expRes.ok ? await expRes.json() : null;
          const evtData = evtRes.ok ? await evtRes.json() : null;
          setDestinations(destData?.data ?? []);
          setFood(foodData?.data ?? []);
          setExperiences(expData?.data ?? []);
          setEvents(evtData?.data ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const categories = [
    { label: "Destinations", href: "#destinations", icon: "📍", count: destinations.length },
    { label: "Traditional Food", href: "#food", icon: "🍜", count: food.length },
    { label: "Local Experiences", href: "#experiences", icon: "✨", count: experiences.length },
    { label: "Festivals & Events", href: "#events", icon: "🎉", count: events.length },
    { label: "Nature & Wildlife", href: "/nature", icon: "🌿", count: null },
    { label: "Heritage & History", href: "/heritage", icon: "🏛", count: null },
    { label: "Dance & Performing Arts", href: "/heritage", icon: "💃", count: null },
    { label: "Travel & Stay", href: "/travel-stay", icon: "🧳", count: null },
  ];

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
          <span>EXPLORE</span>
          <h1>Discover Manipur</h1>
          <p>
            Explore the culture, wildlife, traditions and symbols of Manipur.
          </p>
        </div>
      </section>

      <main className="nature-content">
        <div style={{ marginBottom: 50 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "#5d8c72",
              fontWeight: 600,
            }}
          >
            DISCOVER
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
            What makes Manipur special.
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
            From floating lakes to ancient traditions, explore everything that
            makes this corner of India unforgettable.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 70,
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "22px 20px",
                border: "1px solid rgba(23,63,43,.07)",
                textDecoration: "none",
                transition: "transform .2s ease, box-shadow .2s ease",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 28 }}>{cat.icon}</span>
              <span
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: 17,
                  fontWeight: 500,
                  color: "#173f2b",
                }}
              >
                {cat.label}
              </span>
              {cat.count !== null && !loading && (
                <span style={{ fontSize: 11, color: "#5d8c72" }}>
                  {cat.count} item{cat.count !== 1 ? "s" : ""}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginBottom: 70 }}>
          <Link
            href="/plan-trip"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#28704e",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              transition: "background .2s ease",
            }}
          >
            Plan My Trip →
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "#66756c", fontSize: 14 }}>Loading...</p>
          </div>
        ) : (
          <>
            {destinations.length > 0 && (
              <section id="destinations" style={{ marginBottom: 70 }}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: "#5d8c72", fontWeight: 600 }}>EXPLORE</span>
                <h2 style={{ marginTop: 10, fontFamily: '"Playfair Display", var(--font-heading), serif', fontSize: 32, fontWeight: 500, color: "#173f2b", marginBottom: 24 }}>Destinations</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                  {destinations.slice(0, 6).map((d) => (
                    <Link key={d.id} href={`/map?destination=${encodeURIComponent(d.name)}`} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(23,63,43,.07)", textDecoration: "none" }}>
                      <div style={{ height: 160, background: "#e8eee9", position: "relative" }}>
                        {d.imageUrl ? (
                          <Image src={d.imageUrl} alt={d.name} fill style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#5d8c72", fontSize: 28 }}>⊕</div>
                        )}
                        {d.category && (
                          <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(23,63,43,.75)", color: "#fff", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, fontWeight: 600 }}>{d.category}</span>
                        )}
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        <h3 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 17, fontWeight: 500, color: "#173f2b" }}>{d.name}</h3>
                        {d.district && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#66756c" }}>{d.district}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {food.length > 0 && (
              <section id="food" style={{ marginBottom: 70 }}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: "#5d8c72", fontWeight: 600 }}>TASTE</span>
                <h2 style={{ marginTop: 10, fontFamily: '"Playfair Display", var(--font-heading), serif', fontSize: 32, fontWeight: 500, color: "#173f2b", marginBottom: 24 }}>Traditional Food</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                  {food.slice(0, 6).map((f) => (
                    <div key={f.id} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(23,63,43,.07)" }}>
                      <div style={{ height: 160, background: "#e8eee9", position: "relative" }}>
                        {f.imageUrl ? (
                          <Image src={f.imageUrl} alt={f.name} fill style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#5d8c72", fontSize: 28 }}>🍜</div>
                        )}
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        <h3 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 17, fontWeight: 500, color: "#173f2b" }}>{f.name}</h3>
                        {f.description && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#66756c", lineHeight: 1.6 }}>{f.description}</p>}
                        {f.cuisine && <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#5d8c72", fontWeight: 600 }}>{f.cuisine}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {experiences.length > 0 && (
              <section id="experiences" style={{ marginBottom: 70 }}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: "#5d8c72", fontWeight: 600 }}>EXPERIENCE</span>
                <h2 style={{ marginTop: 10, fontFamily: '"Playfair Display", var(--font-heading), serif', fontSize: 32, fontWeight: 500, color: "#173f2b", marginBottom: 24 }}>Local Experiences</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                  {experiences.slice(0, 6).map((e) => (
                    <div key={e.id} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(23,63,43,.07)" }}>
                      <div style={{ height: 160, background: "#e8eee9", position: "relative" }}>
                        {e.imageUrl ? (
                          <Image src={e.imageUrl} alt={e.name} fill style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#5d8c72", fontSize: 28 }}>✨</div>
                        )}
                        {e.category && (
                          <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(23,63,43,.75)", color: "#fff", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, fontWeight: 600 }}>{e.category}</span>
                        )}
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        <h3 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 17, fontWeight: 500, color: "#173f2b" }}>{e.name}</h3>
                        {e.description && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#66756c", lineHeight: 1.6 }}>{e.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {events.length > 0 && (
              <section id="events" style={{ marginBottom: 70 }}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: "#5d8c72", fontWeight: 600 }}>CELEBRATE</span>
                <h2 style={{ marginTop: 10, fontFamily: '"Playfair Display", var(--font-heading), serif', fontSize: 32, fontWeight: 500, color: "#173f2b", marginBottom: 24 }}>Festivals & Events</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                  {events.slice(0, 6).map((ev) => (
                    <div key={ev.id} style={{ background: "#fff", borderRadius: 18, padding: "18px 20px", border: "1px solid rgba(23,63,43,.07)" }}>
                      <h3 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 17, fontWeight: 500, color: "#173f2b" }}>{ev.name}</h3>
                      {ev.category && <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#5d8c72", fontWeight: 600 }}>{ev.category}</span>}
                      {ev.description && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#66756c", lineHeight: 1.6 }}>{ev.description}</p>}
                      {ev.startDate && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#28704e", fontWeight: 500 }}>{ev.startDate}{ev.endDate ? ` – ${ev.endDate}` : ""}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section style={{ marginBottom: 70 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: "#5d8c72", fontWeight: 600 }}>CULTURE</span>
          <h2 style={{ marginTop: 10, fontFamily: '"Playfair Display", var(--font-heading), serif', fontSize: 32, fontWeight: 500, color: "#173f2b", marginBottom: 24 }}>Dance & Performing Arts</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 18, padding: "24px 22px", border: "1px solid rgba(23,63,43,.07)" }}>
              <h3 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 19, fontWeight: 500, color: "#173f2b" }}>Ras Lila</h3>
              <p style={{ margin: "10px 0 0", fontSize: 13, color: "#66756c", lineHeight: 1.7 }}>A classical Manipuri dance form depicting the divine love of Radha and Krishna, performed with graceful movements and devotional music.</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 18, padding: "24px 22px", border: "1px solid rgba(23,63,43,.07)" }}>
              <h3 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 19, fontWeight: 500, color: "#173f2b" }}>Thang-Ta</h3>
              <p style={{ margin: "10px 0 0", fontSize: 13, color: "#66756c", lineHeight: 1.7 }}>An ancient martial art combining sword (thang) and spear (ta) techniques, performed as both combat training and cultural expression.</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 18, padding: "24px 22px", border: "1px solid rgba(23,63,43,.07)" }}>
              <h3 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 19, fontWeight: 500, color: "#173f2b" }}>Lai Haraoba</h3>
              <p style={{ margin: "10px 0 0", fontSize: 13, color: "#66756c", lineHeight: 1.7 }}>A traditional festival featuring ritualistic dances and music dedicated to local deities, celebrating creation myths and community life.</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 70 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: "#5d8c72", fontWeight: 600 }}>EXPERIENCES</span>
          <h2 style={{ marginTop: 10, fontFamily: '"Playfair Display", var(--font-heading), serif', fontSize: 32, fontWeight: 500, color: "#173f2b", marginBottom: 24 }}>Explore by theme</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <Link href="/nature" style={{ position: "relative", height: 200, borderRadius: 18, overflow: "hidden", textDecoration: "none", display: "block" }}>
              <Image src="/images/loktak-alt.jpg" alt="Nature" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,35,25,.7), transparent)", display: "flex", alignItems: "flex-end", padding: 18 }}>
                <span style={{ color: "#fff", fontFamily: '"Playfair Display", serif', fontSize: 20, fontWeight: 500 }}>Nature & Wildlife</span>
              </div>
            </Link>
            <Link href="/heritage" style={{ position: "relative", height: 200, borderRadius: 18, overflow: "hidden", textDecoration: "none", display: "block" }}>
              <Image src="/images/kangla.png" alt="Heritage" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,35,25,.7), transparent)", display: "flex", alignItems: "flex-end", padding: 18 }}>
                <span style={{ color: "#fff", fontFamily: '"Playfair Display", serif', fontSize: 20, fontWeight: 500 }}>Heritage & History</span>
              </div>
            </Link>
            <Link href="/adventure" style={{ position: "relative", height: 200, borderRadius: 18, overflow: "hidden", textDecoration: "none", display: "block" }}>
              <Image src="/images/shirui.jpg" alt="Adventure" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,35,25,.7), transparent)", display: "flex", alignItems: "flex-end", padding: 18 }}>
                <span style={{ color: "#fff", fontFamily: '"Playfair Display", serif', fontSize: 20, fontWeight: 500 }}>Adventure</span>
              </div>
            </Link>
            <Link href="/historical" style={{ position: "relative", height: 200, borderRadius: 18, overflow: "hidden", textDecoration: "none", display: "block" }}>
              <Image src="/images/red-hill.png" alt="Historical" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,35,25,.7), transparent)", display: "flex", alignItems: "flex-end", padding: 18 }}>
                <span style={{ color: "#fff", fontFamily: '"Playfair Display", serif', fontSize: 20, fontWeight: 500 }}>Historical Places</span>
              </div>
            </Link>
          </div>
        </section>
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
