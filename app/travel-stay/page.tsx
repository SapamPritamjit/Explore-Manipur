"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


type TransportItem = { id: string; origin: string; destination: string; transportType?: string | null; approxDistance?: number | null; approxTime?: string | null; notes?: string | null };
type AccommodationItem = { id: string; name: string; type?: string | null; district?: string | null; location?: string | null; bookingUrl?: string | null };

function matchesCategory(type: string | null | undefined, category: string): boolean {
  if (!type) return false;
  const lower = type.toLowerCase();
  const catLower = category.toLowerCase();
  if (catLower === "lodges & guesthouses") return lower.includes("lodge") || lower.includes("guesthouse");
  return lower.includes(catLower.replace(/s$/, ""));
}

export default function TravelStayPage() {
  const [transport, setTransport] = useState<TransportItem[]>([]);
  const [accommodation, setAccommodation] = useState<AccommodationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [tRes, aRes] = await Promise.all([fetch("/api/explore?type=transport"), fetch("/api/explore?type=accommodation")]);
        if (!cancelled) {
          const tData = tRes.ok ? await tRes.json() : null;
          const aData = aRes.ok ? await aRes.json() : null;
          setTransport(tData?.data ?? []);
          setAccommodation(aData?.data ?? []);
          setLoading(false);
        }
      } catch { if (!cancelled) { setError("Failed to load data."); setLoading(false); } }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = activeCategory ? accommodation.filter(a => matchesCategory(a.type, activeCategory)) : accommodation;
  const categories = [{ label: "Hotels", icon: "fa-hotel" }, { label: "Resorts", icon: "fa-tree-city" }, { label: "Homestays", icon: "fa-house" }, { label: "Lodges & Guesthouses", icon: "fa-mountain-sun" }];

  return (
    <>
      
      <div>
        <header className="navbar" style={{ position: "sticky", background: "rgba(248,245,237,.96)", borderBottom: "1px solid rgba(23,63,43,.08)", backdropFilter: "blur(10px)" }}>
          <div className="logo"><span className="logo-mark" style={{ background: "#173f2b", color: "#fff" }}></span><span>Explore Manipur</span></div>
          <nav className="nav-links"><Link href="/#experiences" style={{ color: "#557362" }}>Experiences</Link><Link href="/#destinations" style={{ color: "#557362" }}>Destinations</Link><Link href="/#map" style={{ color: "#557362" }}>Map</Link></nav>
          <Link href="/" className="nav-button" style={{ border: "1px solid rgba(23,63,43,.18)", background: "transparent", color: "#173f2b" }}><i className="fa-solid fa-arrow-left"></i> Back Home</Link>
        </header>
        <section style={{ minHeight: 520, padding: "80px 7%", display: "flex", alignItems: "flex-end", position: "relative", background: "linear-gradient(to top,rgba(10,45,30,.84),rgba(10,45,30,.12)),url('/images/travel-stay.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div style={{ maxWidth: 780, color: "#fff" }}><span style={{ fontSize: 11, letterSpacing: 3, fontWeight: 600, opacity: .85 }}>PLAN YOUR JOURNEY</span><h1 style={{ margin: "12px 0 0", fontFamily: '"Playfair Display",serif', fontSize: "clamp(48px,7vw,82px)", lineHeight: 1, fontWeight: 500 }}>Travel &amp; Stay</h1><p style={{ maxWidth: 620, marginTop: 20, fontSize: 16, lineHeight: 1.7, opacity: .9 }}>Find convenient ways to move around Manipur and accommodation options that fit the way you want to experience the state.</p></div>
        </section>
        <main style={{ maxWidth: 1150, margin: "auto", padding: "80px 6% 110px" }}>
          <Link href="/#experiences" className="back-link"><i className="fa-solid fa-arrow-left"></i> Back to Experiences</Link>
          {loading && <p style={{ color: "#66756c" }}>Loading...</p>}
          {error && <p style={{ color: "#b45309" }}>{error}</p>}
          {!loading && !error && (
            <>
              <div style={{ maxWidth: 720, marginBottom: 55 }}><span style={{ fontSize: 10, letterSpacing: 2, color: "#5d8c72", fontWeight: 600 }}>GETTING AROUND MANIPUR</span><h2 style={{ margin: "10px 0 0", fontFamily: '"Playfair Display",serif', fontWeight: 500, fontSize: 44, lineHeight: 1.1 }}>Choose your way around.</h2><p style={{ color: "#66756c", lineHeight: 1.75, fontSize: 14, marginTop: 18 }}>From flexible private rides to everyday local transport, explore the options that can help you move comfortably between Imphal and destinations across Manipur.</p></div>
              <section style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, marginBottom: 100 }}>
                {transport.length === 0 && (
                  <>
                    <article style={{ background: "#fff", borderRadius: 20, padding: 30, minHeight: 285, border: "1px solid rgba(23,63,43,.07)" }}><div style={{ width: 48, height: 48, borderRadius: 14, background: "#edf5ef", color: "#28704e", display: "grid", placeItems: "center", fontSize: 19, marginBottom: 22 }}><i className="fa-solid fa-car-side"></i></div><h3 style={{ margin: 0, fontFamily: '"Playfair Display",serif', fontSize: 27, fontWeight: 500 }}>Private Cabs</h3><p style={{ marginTop: 13, color: "#66756c", fontSize: 13, lineHeight: 1.7 }}>A convenient option for airport transfers, sightseeing and longer journeys.</p></article>
                    <article style={{ background: "#fff", borderRadius: 20, padding: 30, minHeight: 285, border: "1px solid rgba(23,63,43,.07)" }}><div style={{ width: 48, height: 48, borderRadius: 14, background: "#edf5ef", color: "#28704e", display: "grid", placeItems: "center", fontSize: 19, marginBottom: 22 }}><i className="fa-solid fa-taxi"></i></div><h3 style={{ margin: 0, fontFamily: '"Playfair Display",serif', fontSize: 27, fontWeight: 500 }}>Local Auto-Rickshaws</h3><p style={{ marginTop: 13, color: "#66756c", fontSize: 13, lineHeight: 1.7 }}>A practical choice for shorter journeys around Imphal.</p></article>
                    <article style={{ background: "#fff", borderRadius: 20, padding: 30, minHeight: 285, border: "1px solid rgba(23,63,43,.07)" }}><div style={{ width: 48, height: 48, borderRadius: 14, background: "#edf5ef", color: "#28704e", display: "grid", placeItems: "center", fontSize: 19, marginBottom: 22 }}><i className="fa-solid fa-bus"></i></div><h3 style={{ margin: 0, fontFamily: '"Playfair Display",serif', fontSize: 27, fontWeight: 500 }}>Bus Connections</h3><p style={{ marginTop: 13, color: "#66756c", fontSize: 13, lineHeight: 1.7 }}>An accessible way to connect Imphal with towns across the state.</p></article>
                  </>
                )}
                {transport.map(t => (
                  <article key={t.id} style={{ background: "#fff", borderRadius: 20, padding: 30, minHeight: 285, border: "1px solid rgba(23,63,43,.07)" }}><div style={{ width: 48, height: 48, borderRadius: 14, background: "#edf5ef", color: "#28704e", display: "grid", placeItems: "center", fontSize: 19, marginBottom: 22 }}><i className="fa-solid fa-taxi"></i></div><h3 style={{ margin: 0, fontFamily: '"Playfair Display",serif', fontSize: 27, fontWeight: 500 }}>{t.origin} &rarr; {t.destination}</h3><p style={{ marginTop: 13, color: "#66756c", fontSize: 13, lineHeight: 1.7 }}>{t.transportType ?? "Transport"}{t.approxDistance != null ? ` · ${t.approxDistance} km` : ""}{t.approxTime != null ? ` · ${t.approxTime}` : ""}</p></article>
                ))}
              </section>
              <div style={{ marginBottom: 45 }}><span style={{ fontSize: 10, letterSpacing: 2, color: "#5d8c72", fontWeight: 600 }}>WHERE TO STAY</span><h2 style={{ margin: "10px 0 0", fontFamily: '"Playfair Display",serif', fontSize: 42, fontWeight: 500, lineHeight: 1.1 }}>Accommodation for every journey.</h2></div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                {categories.map(cat => (
                  <button key={cat.label} type="button" onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)} style={{ minHeight: 86, padding: "18px 14px", background: activeCategory === cat.label ? "#edf5ef" : "#fff", border: "1px solid rgba(23,63,43,.07)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 9, color: activeCategory === cat.label ? "#173f2b" : "#557362", fontSize: 12, cursor: "pointer" }}>
                    <i className={`fa-solid ${cat.icon}`} style={{ color: "#28704e", fontSize: 17 }}></i><span>{cat.label}</span>
                  </button>
                ))}
              </div>
              <p style={{ maxWidth: 650, margin: "14px 0 28px", color: "#66756c", fontSize: 13 }}>Showing {filtered.length} option{filtered.length !== 1 ? "s" : ""}{activeCategory ? ` in ${activeCategory}` : ""}.</p>
              <div style={{ display: "grid", gap: 12 }}>
                {filtered.length === 0 && <div style={{ background: "#fff", borderRadius: 22, padding: 40, border: "1px dashed rgba(23,63,43,.13)", textAlign: "center" }}><p style={{ color: "#718077", fontSize: 12 }}>No accommodation found in this category.</p></div>}
                {filtered.map(acc => (
                  <details key={acc.id} style={{ background: "#fff", border: "1px solid rgba(23,63,43,.08)", borderRadius: 18, overflow: "hidden" }} open>
                    <summary style={{ listStyle: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "22px 24px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 17 }}><i className="fa-solid fa-hotel" style={{ width: 44, height: 44, borderRadius: 13, background: "#edf5ef", color: "#28704e", display: "grid", placeItems: "center", fontSize: 17 }}></i><span><strong style={{ display: "block", fontFamily: '"Playfair Display",serif', fontSize: 23, fontWeight: 500, color: "#173f2b" }}>{acc.name}</strong><small style={{ display: "block", marginTop: 4, color: "#718077", fontSize: 11 }}>{acc.type ?? "Accommodation"}{acc.district ? ` · ${acc.district}` : ""}</small></span></span>
                      <i className="fa-solid fa-chevron-down" style={{ color: "#5d8c72", fontSize: 12 }}></i>
                    </summary>
                    <div style={{ padding: "0 24px 20px 85px" }}>
                      {acc.bookingUrl ? <a href={acc.bookingUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 17px", border: "1px solid rgba(23,63,43,.07)", borderRadius: 13, textDecoration: "none", color: "#173f2b", background: "#fafbf8" }}><span><strong style={{ fontSize: 13, fontWeight: 600 }}>{acc.name}</strong><small style={{ display: "block", marginTop: 4, color: "#718077", fontSize: 10 }}>{acc.location ?? acc.district ?? ""}</small></span><i className="fa-solid fa-arrow-right" style={{ color: "#28704e", fontSize: 11 }}></i></a> : <div style={{ padding: "14px 17px", border: "1px solid rgba(23,63,43,.07)", borderRadius: 13, color: "#173f2b", background: "#fafbf8" }}><strong style={{ fontSize: 13, fontWeight: 600 }}>{acc.name}</strong></div>}
                    </div>
                  </details>
                ))}
              </div>
            </>
          )}
        </main>
        <footer style={{ background: "#173f2b", color: "#fff", padding: "55px 6% 25px" }}>
          <div style={{ maxWidth: 1150, margin: "auto", display: "flex", justifyContent: "space-between", gap: 50 }}><div><div className="logo" style={{ color: "#fff" }}><span className="logo-mark" style={{ background: "#fff", color: "#173f2b" }}>M</span> Explore Manipur</div><p style={{ color: "rgba(255,255,255,.65)", fontSize: 13, marginTop: 12 }}>Discover. Experience. Remember.</p></div><div style={{ display: "flex", gap: 80 }}><div><h4 style={{ fontSize: 11, letterSpacing: 2, marginBottom: 15 }}>Explore</h4><Link href="/#destinations" style={{ display: "block", color: "rgba(255,255,255,.65)", fontSize: 13, marginBottom: 8 }}>Destinations</Link><Link href="/#experiences" style={{ display: "block", color: "rgba(255,255,255,.65)", fontSize: 13, marginBottom: 8 }}>Experiences</Link><Link href="/#map" style={{ display: "block", color: "rgba(255,255,255,.65)", fontSize: 13, marginBottom: 8 }}>Map</Link></div><div><h4 style={{ fontSize: 11, letterSpacing: 2, marginBottom: 15 }}>Plan</h4><Link href="/plan-trip" style={{ display: "block", color: "rgba(255,255,255,.65)", fontSize: 13, marginBottom: 8 }}>Plan a Trip</Link><Link href="/travel-stay" style={{ display: "block", color: "rgba(255,255,255,.65)", fontSize: 13, marginBottom: 8 }}>Travel &amp; Stay</Link></div></div></div>
          <div style={{ maxWidth: 1150, margin: "45px auto 0", paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.5)", fontSize: 11 }}>&copy; 2026 Explore Manipur</div>
        </footer>
      </div>
    </>
  );
}
