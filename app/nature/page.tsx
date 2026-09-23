"use client";

import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/ui/nav";

export default function NaturePage() {
  return (
    <div className="nature-page">
      <Nav />
      <section className="nature-hero" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,45,30,0.82), rgba(10,45,30,0.12)), url("/images/loktak-alt.jpg")' }}>
        <div className="nature-hero-content">
          <span>EXPERIENCE • NATURE</span>
          <h1>Nature</h1>
          <p>From floating islands and rare wildlife to mist-covered hills, discover the landscapes that make Manipur unforgettable.</p>
        </div>
      </section>
      <main className="nature-content">
        <Link href="/#experiences" className="back-link">← Back to Experiences</Link>
        <div className="nature-intro">
          <span>NATURE OF MANIPUR</span>
          <h2>Landscapes worth discovering.</h2>
        </div>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/loktak-alt.jpg" alt="Loktak Lake, Manipur" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">01 / 03</span>
            <h2>Loktak Lake</h2>
            <p className="place-description">Manipur&apos;s iconic freshwater lake, famous for its floating phumdis and peaceful landscapes.</p>
            <div className="place-location"><span>Moirang, Bishnupur District, Manipur</span></div>
            <Link href="/map?destination=Loktak%20Lake" className="map-link">Explore on Map →</Link>
            <div className="why-visit">
              <h4>Why Visit?</h4>
              <ul>
                <li>Experience the unique floating islands</li>
                <li>Enjoy scenic lake views and boating</li>
                <li>Explore the surrounding local culture</li>
                <li>Close to Keibul Lamjao National Park</li>
              </ul>
            </div>
            <div className="travel-tips">
              <h4>Travel Tips</h4>
              <p><strong>Best time:</strong> October–April</p>
              <p>Visit in the morning or around sunset</p>
              <p>Carry water and comfortable footwear</p>
            </div>
          </div>
        </article>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/keibul.jpeg" alt="Keibul Lamjao National Park" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">02 / 03</span>
            <h2>Keibul Lamjao National Park</h2>
            <p className="place-description">The world&apos;s only floating national park, famous for its unique phumdis and home to the endangered Sangai deer.</p>
            <div className="place-location"><span>Bishnupur District, Manipur</span></div>
            <Link href="/map?destination=Keibul%20Lamjao%20National%20Park" className="map-link">Explore on Map →</Link>
            <div className="why-visit">
              <h4>Why Visit?</h4>
              <ul>
                <li>See the rare Sangai deer</li>
                <li>Experience its unique floating ecosystem</li>
                <li>Enjoy scenic wetlands and wildlife</li>
                <li>Explore one of Manipur&apos;s distinctive landscapes</li>
              </ul>
            </div>
            <div className="travel-tips">
              <h4>Travel Tips</h4>
              <p><strong>Best time:</strong> October–March</p>
              <p>Visit during daylight for better wildlife viewing</p>
              <p>Carry binoculars and comfortable footwear</p>
            </div>
          </div>
        </article>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/shirui.jpg" alt="Shirui Hills, Ukhrul, Manipur" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">03 / 03</span>
            <h2>Shirui Hills</h2>
            <p className="place-description">A beautiful hill destination in Ukhrul, known for the rare Shirui Lily and breathtaking mountain scenery.</p>
            <div className="place-location"><span>Ukhrul District, Manipur</span></div>
            <Link href="/map?destination=Shirui%20Hills" className="map-link">Explore on Map →</Link>
            <div className="why-visit">
              <h4>Why Visit?</h4>
              <ul>
                <li>See the famous Shirui Lily</li>
                <li>Enjoy panoramic mountain views</li>
                <li>Experience peaceful hill landscapes</li>
                <li>Great for trekking and nature photography</li>
              </ul>
            </div>
            <div className="travel-tips">
              <h4>Travel Tips</h4>
              <p><strong>Best time:</strong> April–June for Shirui Lily season</p>
              <p>Carry comfortable trekking shoes</p>
              <p>Check weather conditions before heading out</p>
            </div>
          </div>
        </article>
      </main>
      <footer className="site-footer">
        <div className="footer-bottom"><span>© 2026 Explore Manipur</span></div>
      </footer>
    </div>
  );
}
