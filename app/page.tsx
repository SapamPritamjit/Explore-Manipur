"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useHeart } from "./team-hooks";
import { getDestinationImage } from "@/lib/destination-images";

type Destination = {
  id: string;
  name: string;
  category?: string | null;
  district?: string | null;
  imageUrl?: string | null;
};

const DESTINATION_NAMES = ["Loktak Lake", "Kangla", "Shirui Hills"];

export default function HomePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hearts, toggle: toggleHeart } = useHeart();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/explore?type=destinations");
        if (!res.ok) throw new Error("Failed to load destinations");
        const json = await res.json();
        if (!cancelled) {
          const all = json.data ?? [];
          const filtered = DESTINATION_NAMES
            .map(name => all.find((d: Destination) => d.name === name))
            .filter(Boolean) as Destination[];
          setDestinations(filtered.length >= 3 ? filtered : []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load destinations.");
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function handleNavClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    document.querySelector("#destinations")?.scrollIntoView({ behavior: "smooth" });
  }

  function getCategoryRoute(category: string | null | undefined): string {
    if (!category) return "/discover";
    const c = category.toLowerCase();
    if (c.includes("nature")) return "/nature";
    if (c.includes("historical")) return "/historical";
    if (c.includes("adventure")) return "/adventure";
    if (c.includes("heritage")) return "/heritage";
    return "/discover";
  }

  return (
    <>
      
      <div>
        <header className="navbar">
          <div className="logo">
            <span className="logo-mark">
              <Image src="/images/logo.jpeg" alt="Explore Manipur" width={34} height={34} />
            </span>
            <span>Explore Manipur</span>
          </div>
          <nav className="nav-links">
            <a href="#experiences">Experiences</a>
            <a href="#destinations">Destinations</a>
            <Link href="/map">Map</Link>
          </nav>
          <button className="nav-button" onClick={handleNavClick}>
            Explore Manipur
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </header>

        <section className="hero" style={{ backgroundImage: 'url("/images/hero.jpeg")' }}>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <span className="eyebrow" style={{ display: "block", width: "100%", textAlign: "center", color: "#c9a24a", fontSize: 22, fontWeight: 600, letterSpacing: 1.5 }}>
              <i>&quot;Manipur the Jewel of India&quot;</i>
            </span>
            <h1>
              Discover<br />
              <span>Manipur, Differently.</span>
            </h1>
            <p>
              Explore breathtaking landscapes, living traditions,
              unforgettable food and experiences across Manipur.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="cta-row">
              <Link href="/discover" className="discover-box" style={{ flex: 1 }}>
                <div className="discover-icon">
                  <i className="fa-solid fa-compass"></i>
                </div>
                <div className="discover-text">
                  <h3>Discover what makes Manipur unique</h3>
                  <p>Tap to explore the culture, wildlife, traditions and symbols of Manipur.</p>
                </div>
                <div className="discover-arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              </Link>
              <Link href="/ai-planner" className="discover-box" style={{ flex: 1 }}>
                <div className="discover-icon">
                  <i className="fa-solid fa-route"></i>
                </div>
                <div className="discover-text">
                  <h3>Plan My Trip</h3>
                  <p>Build a personalized Manipur itinerary with our smart trip planner.</p>
                </div>
                <div className="discover-arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              </Link>
            </div>
            <style>{`@media (min-width: 768px) { .cta-row { flex-direction: row !important; } }`}</style>
          </div>
        </section>

        <section className="experience-section" id="experiences">
          <div className="experience-heading">
            <span>EXPERIENCE</span>
            <h2>Find your way to experience Manipur.</h2>
          </div>
          <div className="experience-grid">
            <Link href="/nature" className="experience-card nature">
              <div className="experience-overlay"></div>
              <div className="experience-content">
                <span></span>
                <h3>Nature</h3>
                <p>Floating lakes, rare wildlife and peaceful mountain landscapes.</p>
                <div className="experience-arrow">
                  Explore <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            </Link>
            <Link href="/heritage" className="experience-card heritage">
              <div className="experience-overlay"></div>
              <div className="experience-content">
                <span></span>
                <h3>Heritage</h3>
                <p>Discover living traditions, historic places and the cultural heart of Manipur.</p>
                <div className="experience-arrow">
                  Explore <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            </Link>
            <Link href="/adventure" className="experience-card adventure">
              <div className="experience-overlay"></div>
              <div className="experience-content">
                <span></span>
                <h3>Adventure</h3>
                <p>Trek through hills, valleys and hidden landscapes across the state.</p>
                <div className="experience-arrow">
                  Explore <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            </Link>
            <Link href="/historical" className="experience-card historical">
              <div className="experience-overlay"></div>
              <div className="experience-content">
                <span></span>
                <h3>Historical Places</h3>
                <p>Walk through the places and stories that shaped Manipur&apos;s history.</p>
                <div className="experience-arrow">
                  Explore <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            </Link>
            <Link href="/travel-stay" className="experience-card travel">
              <div className="experience-overlay"></div>
              <div className="experience-content">
                <span></span>
                <h3>Travel Around Manipur</h3>
                <p>Plan your journey across destinations, experiences and places worth discovering.</p>
                <div className="experience-arrow">
                  Explore <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="section" id="destinations">
          <div className="section-heading">
            <div>
              <span className="small-label">EXPLORE</span>
              <h2>Places worth discovering.</h2>
            </div>
            <Link href="/discover" className="view-all"></Link>
          </div>
          <div className="destination-grid">
            {loading && <p style={{ color: "#66756c", fontSize: 14 }}>Loading destinations...</p>}
            {error && <p style={{ color: "#b45309", fontSize: 14 }}>{error}</p>}
            {!loading && !error && destinations.map((d, i) => (
              <article
                key={d.id}
                className="destination-card large-card"
                onClick={() => window.location.href = getCategoryRoute(d.category)}
              >
                <div className="card-image">
                  {d.imageUrl || getDestinationImage(d.name) ? (
                    <Image src={d.imageUrl || getDestinationImage(d.name)!} alt={d.name} fill />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "#e8eee9", color: "#5d8c72", fontSize: 28 }}>&#x2295;</div>
                  )}
                  <span className="category">{d.category ?? ""}</span>
                  <button
                    className="heart"
                    onClick={(e) => { e.stopPropagation(); toggleHeart(i); }}
                  >
                    <i className={hearts.has(i) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                  </button>
                </div>
                <div className="card-info">
                  <Link href={`/map?destination=${encodeURIComponent(d.name)}`} onClick={(e) => e.stopPropagation()} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textDecoration: "none", color: "inherit" }}>
                    <div>
                      <h3>{d.name}</h3>
                      <p>
                        <i className="fa-solid fa-location-dot"></i>
                        {d.district ?? ""}
                      </p>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-from-square card-arrow"></i>
                  </Link>
                </div>
              </article>
            ))}
            {!loading && !error && destinations.length === 0 && (
              <>
                <article className="destination-card large-card" onClick={() => window.location.href = '/nature'}>
                  <div className="card-image">
                    <Image src="/images/loktak.jpg" alt="Loktak Lake, Manipur" fill />
                    <span className="category">NATURE</span>
                    <button className="heart" onClick={(e) => { e.stopPropagation(); toggleHeart(0); }}>
                      <i className={hearts.has(0) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                    </button>
                  </div>
                  <div className="card-info">
                    <div><h3>Loktak Lake</h3><p><i className="fa-solid fa-location-dot"></i>Bishnupur</p></div>
                    <i className="fa-solid fa-arrow-up-right-from-square card-arrow"></i>
                  </div>
                </article>
                <article className="destination-card large-card" onClick={() => window.location.href = '/historical'}>
                  <div className="card-image">
                    <Image src="/images/kangla.png" alt="Kangla Fort, Imphal, Manipur" fill />
                    <span className="category">HISTORICAL PLACES</span>
                    <button className="heart" onClick={(e) => { e.stopPropagation(); toggleHeart(1); }}>
                      <i className={hearts.has(1) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                    </button>
                  </div>
                  <div className="card-info">
                    <div><h3>Kangla</h3><p><i className="fa-solid fa-location-dot"></i>Imphal</p></div>
                    <i className="fa-solid fa-arrow-up-right-from-square card-arrow"></i>
                  </div>
                </article>
                <article className="destination-card large-card" onClick={() => window.location.href = '/adventure'}>
                  <div className="card-image">
                    <Image src="/images/shirui.jpg" alt="Shirui Hills, Ukhrul, Manipur" fill />
                    <span className="category">ADVENTURE</span>
                    <button className="heart" onClick={(e) => { e.stopPropagation(); toggleHeart(2); }}>
                      <i className={hearts.has(2) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                    </button>
                  </div>
                  <div className="card-info">
                    <div><h3>Shirui Hills</h3><p><i className="fa-solid fa-location-dot"></i>Ukhrul</p></div>
                    <i className="fa-solid fa-arrow-up-right-from-square card-arrow"></i>
                  </div>
                </article>
              </>
            )}
          </div>
        </section>

        <section className="map-section" id="map">
          <div className="map-content">
            <span className="small-label">EXPLORE THE MAP</span>
            <h2>Manipur,<br />at your fingertips.</h2>
            <p>Discover destinations, attractions and experiences across the state — all in one place.</p>
            <Link href="/map" className="primary-button">
              Explore the Map <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <div className="map-preview">
            <div className="map-shape">
              <div className="map-dot dot-one"><span>Loktak Lake</span></div>
              <div className="map-dot dot-two"><span>Kangla</span></div>
              <div className="map-dot dot-three"><span>Ukhrul</span></div>
              <div className="map-dot dot-four"><span>Moirang</span></div>
            </div>
          </div>
        </section>

        <section className="starter-section">
          <div className="starter-content">
            <span className="starter-label">FIRST TIME IN MANIPUR?</span>
            <h2>Start Here</h2>
            <p className="starter-title">A 5-Day Manipur Experience</p>
            <p className="starter-description">
              Discover the places, culture, food, nature and local
              experiences that make Manipur unique.
            </p>
            <a href="/5-day-manipur-experience.pdf" className="starter-button" download>
              <i className="fa-solid fa-download"></i>
              Download 5-Day Guide
            </a>
          </div>
        </section>

        <footer>
          <div className="footer-top">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo-mark">
                  <Image src="/images/logo.jpeg" alt="Explore Manipur" width={34} height={34} />
                </span>
                Explore Manipur
              </div>
              <p>Discover. Experience. Remember.</p>
            </div>
            <div className="footer-links">
              <div>
                <h4>Explore</h4>
                <a href="#destinations">Destinations</a>
                <a href="#experiences">Experiences</a>
                <a href="#map">Map</a>
              </div>
              <div>
                <h4>Experience</h4>
                <Link href="/food">Food</Link>
                <Link href="/discover">Culture</Link>
                <Link href="/festivals">Events</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Explore Manipur</span>
          </div>
        </footer>
      </div>
    </>
  );
}
