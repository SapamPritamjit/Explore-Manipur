import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/ui/nav";

export default function HeritagePage() {
  return (
    <div className="nature-page">
      <Nav />
      <section className="nature-hero" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,35,25,0.82), rgba(10,35,25,0.10)), url("/images/ima-keithel.jpg")' }}>
        <div className="nature-hero-content">
          <span>EXPERIENCE • HERITAGE</span>
          <h1>Heritage</h1>
          <p>Discover the traditions, architecture and cultural spaces that preserve the rich heritage of Manipur.</p>
        </div>
      </section>
      <main className="nature-content">
        <div className="nature-intro">
          <span>HERITAGE OF MANIPUR</span>
          <h2>Stories preserved through generations.</h2>
        </div>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/ima-keithel.jpg" alt="Ima Keithel, Imphal" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">01 / HERITAGE</span>
            <h2>Ima Keithel</h2>
            <p className="place-description">A symbol of feminine power, Ima Keithel is a more-than-500-year-old all-women&apos;s market run by over 3,000 Emas (mothers). It is a popular shopping destination offering a variety of local and traditional goods.</p>
            <div className="place-location"><span>Imphal, Manipur</span></div>
            <Link href="/map?destination=Ima%20Market%20(Khwairamband%20Bazar)" className="map-link">Explore on Map →</Link>
            <div className="why-visit">
              <h4>WHY VISIT?</h4>
              <ul>
                <li>Experience a unique women-run marketplace</li>
                <li>Shop for local and traditional products</li>
                <li>Experience everyday Manipuri culture</li>
                <li>Explore one of Manipur&apos;s most distinctive markets</li>
              </ul>
            </div>
            <div className="travel-tips">
              <h4>TRAVEL TIPS</h4>
              <p><strong>Best time:</strong> Morning–afternoon</p>
              <p>Carry cash for smaller purchases</p>
              <p>Ask before photographing vendors</p>
            </div>
          </div>
        </article>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/govindajee.jpg" alt="Shree Shree Govindajee Temple, Imphal" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">02 / HERITAGE</span>
            <h2>Shree Shree Govindajee Temple</h2>
            <p className="place-description">A historic centre of the Vaishnavites in Manipur, featuring twin domes covered with gold-plated sheets, a paved courtyard and a large congregation hall. The presiding deity, Radha-Krishna, is carved from a jackfruit tree.</p>
            <div className="place-location"><span>Imphal, Manipur</span></div>
            <Link href="/map?destination=Shree%20Shree%20Govindajee%20Temple" className="map-link">Explore on Map →</Link>
            <div className="why-visit">
              <h4>WHY VISIT?</h4>
              <ul>
                <li>Admire its distinctive twin-dome architecture</li>
                <li>Experience Manipur&apos;s Vaishnavite traditions</li>
                <li>Witness daily devotional activities</li>
                <li>Experience the temple&apos;s traditional vegetarian prasad</li>
              </ul>
            </div>
            <div className="travel-tips">
              <h4>TRAVEL TIPS</h4>
              <p><strong>Best time:</strong> Morning or evening</p>
              <p>Dress modestly</p>
              <p>Follow temple customs and maintain a respectful atmosphere</p>
            </div>
          </div>
        </article>
        <article className="nature-place">
          <div className="nature-place-image">
            <Image src="/images/andro.jpeg" alt="Andro village, Manipur" width={600} height={480} />
          </div>
          <div className="nature-place-info">
            <span className="place-number">03 / HERITAGE</span>
            <h2>Andro</h2>
            <p className="place-description">Andro is a historic village near Imphal known for its rich cultural heritage, traditional pottery and preserved indigenous practices. The village is home to the Andro Gramsang Museum, which showcases traditional pottery, artefacts and cultural objects representing different Manipuri tribes.</p>
            <div className="place-location"><span>Andro, Imphal East, Manipur</span></div>
            <span className="map-link" style={{ opacity: 0.5, cursor: "default", pointerEvents: "none" }}>Map unavailable</span>
            <div className="why-visit">
              <h4>WHY VISIT?</h4>
              <ul>
                <li>Explore traditional Manipuri pottery</li>
                <li>Visit the Andro Gramsang Museum</li>
                <li>Discover indigenous crafts and traditions</li>
                <li>Experience the village&apos;s cultural heritage</li>
              </ul>
            </div>
            <div className="travel-tips">
              <h4>TRAVEL TIPS</h4>
              <p><strong>Best time:</strong> October–February</p>
              <p>Explore the village and museum together</p>
              <p>Respect local traditions and cultural spaces</p>
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
