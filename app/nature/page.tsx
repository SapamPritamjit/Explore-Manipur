"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDestinationImage } from "@/lib/destination-images";

type Destination = { id: string; name: string; description?: string | null; imageUrl?: string | null; district?: string | null; category?: string | null };

const STATIC_PLACES = [
  { name: "Loktak Lake", desc: "Manipur's iconic freshwater lake, famous for its floating phumdis and peaceful landscapes.", location: "Moirang, Bishnupur District, Manipur", img: "/images/loktak-alt.jpg", why: ["Experience the unique floating islands","Enjoy scenic lake views and boating","Explore the surrounding local culture","Close to Keibul Lamjao National Park"], tips: [["Best time:","October–April"],["Visit in the morning or around sunset",""],["Carry water and comfortable footwear",""]] },
  { name: "Keibul Lamjao National Park", desc: "The world's only floating national park, famous for its unique phumdis and home to the endangered Sangai deer.", location: "Bishnupur District, Manipur", img: "/images/keibul.jpeg", why: ["See the rare Sangai deer","Experience its unique floating ecosystem","Enjoy scenic wetlands and wildlife","Explore one of Manipur's distinctive landscapes"], tips: [["Best time:","October–March"],["Visit during daylight for better wildlife viewing",""],["Carry binoculars and comfortable footwear",""]] },
  { name: "Shirui Hills", desc: "A beautiful hill destination in Ukhrul, known for the rare Shirui Lily and breathtaking mountain scenery.", location: "Ukhrul District, Manipur", img: "/images/shirui.jpg", why: ["See the famous Shirui Lily","Enjoy panoramic mountain views","Experience peaceful hill landscapes","Great for trekking and nature photography"], tips: [["Best time:","April–June for Shirui Lily season"],["Carry comfortable trekking shoes",""],["Check weather conditions before heading out",""]] },
];

export default function NaturePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/explore?type=destinations").then(r => r.ok ? r.json() : null).then(d => {
      if (!cancelled && d?.data) setDestinations(d.data.filter((x: Destination) => x.category?.toLowerCase().includes("nature")));
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const places = destinations.length > 0 ? destinations.map(d => ({ name: d.name, desc: d.description ?? "", location: d.district ?? "", img: d.imageUrl || getDestinationImage(d.name) || "", why: [] as string[], tips: [] as string[][] })) : STATIC_PLACES;

  return (
    <div className="nature-page">
      <header className="navbar">
        <div className="logo"><span className="logo-mark"><Image src="/images/logo.jpeg" alt="Explore Manipur" width={34} height={34} /></span><span>Explore Manipur</span></div>
        <nav className="nav-links"><Link href="/#experiences">Experiences</Link><Link href="/#destinations">Destinations</Link><Link href="/#map">Map</Link></nav>
        <Link href="/" className="nav-button"><i className="fa-solid fa-arrow-left"></i> Back Home</Link>
      </header>
      <section className="nature-hero" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,45,30,0.82), rgba(10,45,30,0.12)), url("/images/nature.jpeg")' }}>
        <div className="nature-hero-content"><span>EXPERIENCE • NATURE</span><h1>Nature</h1><p>From floating islands and rare wildlife to mist-covered hills, discover the landscapes that make Manipur unforgettable.</p></div>
      </section>
      <main className="nature-content">
        <Link href="/#experiences" className="back-link"><i className="fa-solid fa-arrow-left"></i> Back to Experiences</Link>
        <div className="nature-intro"><span>NATURE OF MANIPUR</span><h2>Landscapes worth discovering.</h2></div>
        {loading && <p style={{ color: "#66756c" }}>Loading...</p>}
        {!loading && places.map((p, i) => (
          <article key={i} className={`nature-place${i % 2 === 1 ? " reverse" : ""}`}>
            <div className="nature-place-image">{p.img ? <Image src={p.img} alt={p.name} fill /> : <div style={{ width:"100%",height:"100%",background:"#e8eee9" }}></div>}</div>
            <div className="nature-place-info">
              <span className="place-number"></span>
              <h2>{p.name}</h2>
              <p className="place-description">{p.desc}</p>
              <div className="place-location"><i className="fa-solid fa-location-dot"></i><span>{p.location}</span></div>
              <Link href={`/map?destination=${encodeURIComponent(p.name)}`} className="map-link">View on Map <i className="fa-solid fa-arrow-up-right-from-square"></i></Link>
              {p.why.length > 0 && <div className="why-visit"><h4>Why Visit?</h4><ul>{p.why.map((w,j)=><li key={j}>{w}</li>)}</ul></div>}
              {p.tips.length > 0 && <div className="travel-tips"><h4>Travel Tips</h4>{p.tips.map(([s,d],j)=>(<p key={j}><strong>{s}</strong>{d}</p>))}</div>}
            </div>
          </article>
        ))}
      </main>
      <footer><div className="footer-top"><div className="footer-brand"><div className="logo"><span className="logo-mark">M</span> Explore Manipur</div><p>Discover. Experience. Remember.</p></div><div className="footer-links"><div><h4>Explore</h4><Link href="/#destinations">Destinations</Link><Link href="/#experiences">Experiences</Link><Link href="/#map">Map</Link></div><div><h4>Discover</h4><Link href="/discover">Culture &amp; Heritage</Link><Link href="/discover">Wildlife</Link><Link href="/discover">Traditions</Link></div></div></div><div className="footer-bottom"><span>&copy; 2026 Explore Manipur</span></div></footer>
    </div>
  );
}
