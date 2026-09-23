import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/ui/nav";

export default function HistoricalPage() {
  return (
    <div className="nature-page">
      <Nav />
      <section className="nature-hero" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,35,25,0.84), rgba(10,35,25,0.10)), url("/images/red-hill.png")' }}>
        <div className="nature-hero-content">
          <span>EXPERIENCE • HISTORY</span>
          <h1>Historical Places</h1>
          <p>Walk through the places, memorials and landmarks that tell the story of Manipur&apos;s past.</p>
        </div>
      </section>
      <main className="nature-content">
        <div className="nature-intro">
          <span>HISTORY OF MANIPUR</span>
          <h2>Places where history lives.</h2>
        </div>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/red-hill.png" alt="Red Hill Maibam Lokpa Ching and India Peace Memorial" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">01 / HISTORY</span>
            <h2>Red Hill & India Peace Memorial</h2>
            <p className="place-description">A significant World War II site where Japanese soldiers and the Indian National Army fought against the British. The India Peace Memorial honours the Japanese soldiers who lost their lives during the battle.</p>
            <div className="place-location"><span>Maibam Lokpa Ching, Bishnupur District, Manipur</span></div>
            <Link href="/map?destination=Red%20Hill%20(Lokpaching)" className="map-link">Explore on Map →</Link>
            <div className="travel-tips">
              <h4>TRAVEL TIPS</h4>
              <ul>
                <li>Best time: Morning or late afternoon</li>
                <li>Maintain a respectful atmosphere at the memorial</li>
                <li>Wear comfortable footwear</li>
              </ul>
            </div>
          </div>
        </article>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/khongjom.png" alt="Khongjom War Memorial" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">02 / HISTORY</span>
            <h2>Khongjom War Memorial</h2>
            <p className="place-description">A historic memorial commemorating Major General Paona Brajabashi and the soldiers who fought against the British during the Anglo-Manipur War of 1891.</p>
            <div className="place-location"><span>Khongjom, Thoubal District, Manipur</span></div>
            <Link href="/map?destination=Khongjom%20War%20Memorial" className="map-link">Explore on Map →</Link>
            <div className="travel-tips">
              <h4>TRAVEL TIPS</h4>
              <ul>
                <li>Best time: Morning or late afternoon</li>
                <li>Khongjom Day: 23 April</li>
                <li>Wear comfortable footwear while exploring the memorial grounds</li>
              </ul>
            </div>
          </div>
        </article>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/ina-memorial.png" alt="INA Memorial, Moirang" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">03 / HISTORY</span>
            <h2>INA Memorial</h2>
            <p className="place-description">A historic memorial in Moirang honouring the sacrifices of Indian soldiers under the leadership of Netaji Subhas Chandra Bose. Its museum preserves photographs, letters, badges and other wartime memorabilia.</p>
            <div className="place-location"><span>Moirang, Bishnupur District, Manipur</span></div>
            <span className="map-link" style={{ opacity: 0.5, cursor: "default", pointerEvents: "none" }}>Map unavailable</span>
            <div className="travel-tips">
              <h4>TRAVEL TIPS</h4>
              <ul>
                <li>Best time: Morning–afternoon</li>
                <li>Allow time to explore the museum</li>
                <li>Maintain a respectful atmosphere around the memorial</li>
              </ul>
            </div>
          </div>
        </article>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/kangla.png" alt="Kangla Fort, Imphal" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">04 / HISTORY</span>
            <h2>Kangla</h2>
            <p className="place-description">A symbol of Manipur&apos;s glory and one of its most important historical and archaeological sites. Kangla served as the royal palace since the time of Pakhangba and remains a sacred site with numerous holy shrines. Located at the heart of Imphal, it is a major destination for exploring Manipur&apos;s history and heritage.</p>
            <div className="place-location"><span>Imphal West District, at the centre of Imphal City</span></div>
            <Link href="/map?destination=Kangla%20Fort" className="map-link">Explore on Map →</Link>
            <div className="travel-tips">
              <h4>TRAVEL TIPS</h4>
              <ul>
                <li>Best time: Morning or late afternoon</li>
                <li>Wear comfortable footwear for exploring the grounds</li>
                <li>Dress respectfully around sacred sites</li>
              </ul>
            </div>
          </div>
        </article>
        <div style={{ textAlign: "center", marginTop: "-30px", marginBottom: "80px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "9px", color: "#173f2b", fontSize: "13px", fontWeight: 600 }}>← Back to Explore Manipur</Link>
        </div>
      </main>
      <footer className="site-footer">
        <div className="footer-bottom"><span>© 2026 Explore Manipur</span></div>
      </footer>
    </div>
  );
}
