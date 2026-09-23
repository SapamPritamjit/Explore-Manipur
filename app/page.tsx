import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/ui/nav";

export default function HomePage() {
  return (
    <div>
      <Nav />

      <section className="hero" style={{ backgroundImage: 'url("/images/hero.jpeg")' }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow">
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
<div className="hero-cta-group" style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "stretch" }}>
            <Link href="/plan-trip" className="primary-button" style={{ textAlign: "center", padding: "14px 28px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
              Plan My Trip →
            </Link>
            <Link href="/discover" className="discover-box">
              <div className="discover-icon">⊕</div>
              <div className="discover-text">
                <h3>Discover what makes Manipur unique</h3>
                <p>Tap to explore the culture, wildlife, traditions and symbols of Manipur.</p>
              </div>
              <div className="discover-arrow">→</div>
            </Link>
          </div>
        </div>
      </section>

      <section className="experience-section" id="experiences">
        <div className="experience-heading">
          <span>EXPERIENCE</span>
          <h2>Find your way to experience Manipur.</h2>
        </div>
        <div className="experience-grid">
          <Link href="/nature" className="experience-card nature">
            <div className="experience-overlay" />
            <div className="experience-content">
              <span />
              <h3>Nature</h3>
              <p>Floating lakes, rare wildlife and peaceful mountain landscapes.</p>
              <div className="experience-arrow">Explore →</div>
            </div>
          </Link>
          <Link href="/heritage" className="experience-card heritage">
            <div className="experience-overlay" />
            <div className="experience-content">
              <span />
              <h3>Heritage</h3>
              <p>Discover traditions, architecture and cultural spaces preserved through generations.</p>
              <div className="experience-arrow">Explore →</div>
            </div>
          </Link>
          <Link href="/adventure" className="experience-card adventure">
            <div className="experience-overlay" />
            <div className="experience-content">
              <span />
              <h3>Adventure</h3>
              <p>Trek through hills, valleys and hidden landscapes across Manipur.</p>
              <div className="experience-arrow">Explore →</div>
            </div>
          </Link>
          <Link href="/historical" className="experience-card historical">
            <div className="experience-overlay" />
            <div className="experience-content">
              <span />
              <h3>Historical Places</h3>
              <p>Walk through landmarks and memorials that tell the story of Manipur.</p>
              <div className="experience-arrow">Explore →</div>
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
          <Link href="/discover" className="view-all">View all →</Link>
        </div>
        <div className="destination-grid">
          <article className="destination-card large-card">
            <div className="card-image">
              <Image src="/images/loktak.jpg" alt="Loktak Lake, Manipur" fill />
              <span className="category">NATURE</span>
              <button className="heart">♡</button>
            </div>
            <div className="card-info">
              <div>
                <h3>Loktak Lake</h3>
                <p>Bishnupur</p>
              </div>
              <span className="card-arrow">↗</span>
            </div>
          </article>
          <article className="destination-card">
            <div className="card-image">
              <Image src="/images/kangla.png" alt="Kangla Fort, Imphal, Manipur" fill />
              <span className="category">HERITAGE</span>
              <button className="heart">♡</button>
            </div>
            <div className="card-info">
              <div>
                <h3>Kangla</h3>
                <p>Imphal</p>
              </div>
              <span className="card-arrow">↗</span>
            </div>
          </article>
          <article className="destination-card">
            <div className="card-image">
              <Image src="/images/shirui.jpg" alt="Shirui Hills, Ukhrul, Manipur" fill />
              <span className="category">ADVENTURE</span>
              <button className="heart">♡</button>
            </div>
            <div className="card-info">
              <div>
                <h3>Shirui Hills</h3>
                <p>Ukhrul</p>
              </div>
              <span className="card-arrow">↗</span>
            </div>
          </article>
        </div>
      </section>

      <section className="map-section" id="map">
        <div className="map-content">
          <span className="small-label">EXPLORE THE MAP</span>
          <h2>Manipur,<br />at your fingertips.</h2>
          <p>Discover destinations, attractions and experiences across the state — all in one place.</p>
          <Link href="/map" className="primary-button">Explore the Map →</Link>
        </div>
      </section>

      <section className="starter-section">
        <div className="starter-content">
          <span className="starter-label">FIRST TIME IN MANIPUR?</span>
          <h2>Start Here</h2>
          <p className="starter-title">A 5-Day Manipur Experience</p>
          <p className="starter-description">
            Discover the places, culture, food, nature and local experiences that make Manipur unique.
          </p>
          <a href="/5-day-manipur-experience.pdf" className="starter-button" download>
            ↓ Download 5-Day Guide
          </a>
        </div>
      </section>

      <footer className="site-footer">
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
              <Link href="/#destinations">Destinations</Link>
              <Link href="/#experiences">Experiences</Link>
              <Link href="/#map">Map</Link>
            </div>
            <div>
              <h4>Experience</h4>
              <Link href="/nature">Nature</Link>
              <Link href="/heritage">Culture</Link>
              <Link href="/adventure">Adventure</Link>
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
