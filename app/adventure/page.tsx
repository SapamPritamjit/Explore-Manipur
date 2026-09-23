import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/ui/nav";

export default function AdventurePage() {
  return (
    <div className="nature-page">
      <Nav />
      <section className="nature-hero" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,35,25,0.82), rgba(10,35,25,0.10)), url("/images/shirui-alt.jpeg")' }}>
        <div className="nature-hero-content">
          <span>EXPERIENCE • ADVENTURE</span>
          <h1>Adventure</h1>
          <p>Trek through mountain landscapes, explore hidden caves and experience the adventurous side of Manipur.</p>
        </div>
      </section>
      <main className="nature-content">
        <div className="nature-intro">
          <span>ADVENTURE IN MANIPUR</span>
          <h2>Trails worth taking.</h2>
        </div>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/shirui.jpg" alt="Shirui Hills, Ukhrul" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">01 / ADVENTURE</span>
            <h2>Shirui Hills</h2>
            <p className="place-description">Home to the rare Shirui Lily, found only in the Siroy Hill Range of Ukhrul. The hills offer beautiful landscapes and a rewarding trekking experience.</p>
            <div className="place-location"><span>Ukhrul District, Manipur</span></div>
            <Link href="/map?destination=Shirui%20Hills" className="map-link">Explore on Map →</Link>
            <div className="why-visit">
              <h4>WHY VISIT?</h4>
              <ul>
                <li>Trek through beautiful mountain landscapes</li>
                <li>See the rare Shirui Lily</li>
                <li>Enjoy panoramic views of the surrounding hills</li>
                <li>Experience one of Manipur&apos;s iconic trekking destinations</li>
              </ul>
            </div>
            <div className="travel-tips">
              <h4>TRAVEL TIPS</h4>
              <p>Wear proper trekking shoes</p>
              <p>Carry sufficient water</p>
              <p>Check weather conditions before trekking</p>
            </div>
          </div>
        </article>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/dzukou.jpg" alt="Dzükou Valley" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">02 / ADVENTURE</span>
            <h2>Dzükou Valley</h2>
            <p className="place-description">Located near the Manipur–Nagaland border, Dzükou Valley is famous for its seasonal flowers and breathtaking green landscapes. It is also one of the region&apos;s popular trekking destinations.</p>
            <div className="place-location"><span>Senapati District, Manipur</span></div>
            <Link href="/map?destination=Dzuko%20Valley" className="map-link">Explore on Map →</Link>
            <div className="why-visit">
              <h4>WHY VISIT?</h4>
              <ul>
                <li>Experience scenic valley landscapes</li>
                <li>Explore seasonal flowers and vegetation</li>
                <li>Take on a rewarding trekking route</li>
                <li>Enjoy peaceful mountain surroundings</li>
              </ul>
            </div>
            <div className="travel-tips">
              <h4>TRAVEL TIPS</h4>
              <p>Wear comfortable trekking footwear</p>
              <p>Carry water and basic trekking essentials</p>
              <p>Check local weather and trail conditions</p>
            </div>
          </div>
        </article>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/tharon.png" alt="Tharon Cave, Manipur" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">03 / ADVENTURE</span>
            <h2>Tharon Cave</h2>
            <p className="place-description">Located near Tamenglong, Tharon Cave is a fascinating natural cave system believed to have been used as shelter thousands of years ago. Excavations have also revealed artefacts associated with the Hoabinhian culture of North Vietnam.</p>
            <div className="place-location"><span>Near Tamenglong, Tamenglong District, Manipur</span></div>
            <Link href="/map?destination=Tharon%20Cave" className="map-link">Explore on Map →</Link>
            <div className="why-visit">
              <h4>WHY VISIT?</h4>
              <ul>
                <li>Explore a fascinating natural cave system</li>
                <li>Discover the area&apos;s archaeological significance</li>
                <li>Experience a less-explored side of Manipur</li>
                <li>Combine adventure with cultural exploration</li>
              </ul>
            </div>
            <div className="travel-tips">
              <h4>TRAVEL TIPS</h4>
              <p>Wear sturdy footwear</p>
              <p>Carry a flashlight and essential supplies</p>
              <p>Explore with local guidance where appropriate</p>
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
