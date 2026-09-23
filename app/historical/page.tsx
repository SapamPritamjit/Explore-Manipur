"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDestinationImage } from "@/lib/destination-images";


type Destination = { id: string; name: string; description?: string | null; imageUrl?: string | null; district?: string | null; category?: string | null };

const STATIC_PLACES = [
  { name: "Red Hill & India Peace Memorial", desc: "A significant World War II site where Japanese soldiers and the Indian National Army fought against the British. The India Peace Memorial honours the Japanese soldiers who lost their lives during the battle.", location: "Maibam Lokpa Ching, Bishnupur District, Manipur", img: "/images/red-hill.png", tips: ["Best time: Morning or late afternoon","Maintain a respectful atmosphere at the memorial","Wear comfortable footwear"] },
  { name: "Khongjom War Memorial", desc: "A historic memorial commemorating Major General Paona Brajabashi and the soldiers who fought against the British during the Anglo-Manipur War of 1891.", location: "Khongjom, Thoubal District, Manipur", img: "/images/khongjom.png", tips: ["Best time: Morning or late afternoon","Khongjom Day: 23 April","Wear comfortable footwear while exploring the memorial grounds"] },
  { name: "INA Memorial", desc: "A historic memorial in Moirang honouring the sacrifices of Indian soldiers under the leadership of Netaji Subhas Chandra Bose. Its museum preserves photographs, letters, badges and other wartime memorabilia.", location: "Moirang, Bishnupur District, Manipur", img: "/images/ina-memorial.png", tips: ["Best time: Morning–afternoon","Allow time to explore the museum","Maintain a respectful atmosphere around the memorial"] },
  { name: "Kangla", desc: "A symbol of Manipur's glory and one of its most important historical and archaeological sites. Kangla served as the royal palace since the time of Pakhangba and remains a sacred site with numerous holy shrines. Located at the heart of Imphal, it is a major destination for exploring Manipur's history and heritage.", location: "Imphal West District, at the centre of Imphal City", img: "/images/kangla.png", tips: ["Best time: Morning or late afternoon","Wear comfortable footwear for exploring the grounds","Dress respectfully around sacred sites"] },
];

export default function HistoricalPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/explore?type=destinations").then(r => r.ok ? r.json() : null).then(d => {
      if (!cancelled && d?.data) setDestinations(d.data.filter((x: Destination) => x.category?.toLowerCase().includes("historical") || x.category?.toLowerCase().includes("history")));
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const places = destinations.length > 0 ? destinations.map(d => ({ name: d.name, desc: d.description ?? "", location: d.district ?? "", img: d.imageUrl || getDestinationImage(d.name) || "", tips: [] })) : STATIC_PLACES;

  return (
      <div className="nature-page">
        <header className="navbar">
          <div className="logo"><span className="logo-mark"><Image src="/images/logo.jpeg" alt="Explore Manipur" width={34} height={34} /></span><span>Explore Manipur</span></div>
          <nav className="nav-links"><Link href="/#experiences">Experiences</Link><Link href="/#destinations">Destinations</Link><Link href="/#map">Map</Link></nav>
          <Link href="/" className="nav-button"><i className="fa-solid fa-arrow-left"></i> Back Home</Link>
        </header>
        <section className="nature-hero" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,35,25,.84), rgba(10,35,25,.10)), url("/images/historical-banner.jpeg")' }}>
          <div className="nature-hero-content"><span>EXPERIENCE • HISTORY</span><h1>Historical Places</h1><p>Walk through the places, memorials and landmarks that tell the story of Manipur&apos;s past.</p></div>
        </section>
        <main className="nature-content">
          <div className="nature-heading"><span>HISTORY OF MANIPUR</span><h2>Places where history lives.</h2></div>
          {loading && <p style={{ color: "#66756c" }}>Loading...</p>}
          {!loading && places.map((p, i) => (
            <article key={i} className={`nature-place${i % 2 === 1 ? " reverse" : ""}`}>
              <div className="nature-image">{p.img ? <Image src={p.img} alt={p.name} fill /> : <div style={{ width:"100%",height:"100%",background:"#dce9df" }}></div>}</div>
              <div className="nature-info">
                <span className="nature-number"></span>
                <h3>{p.name}</h3>
                <p className="nature-description">{p.desc}</p>
                <div className="nature-location"><i className="fa-solid fa-location-dot"></i><span>{p.location}</span></div>
                {p.img ? <Link href={`/map?destination=${encodeURIComponent(p.name)}`} className="map-link"><i className="fa-solid fa-map-location-dot"></i> View on Map <i className="fa-solid fa-arrow-right"></i></Link> : <span className="map-link" style={{ opacity: 0.5, pointerEvents: "none" }}><i className="fa-solid fa-map-location-dot"></i> Map unavailable</span>}
                {p.tips.length > 0 && <div className="travel-tips"><h4>TRAVEL TIPS</h4><ul>{p.tips.map((t,j)=>(<li key={j}>{t}</li>))}</ul></div>}
              </div>
            </article>
          ))}
          <div className="back-home"><Link href="/"><i className="fa-solid fa-arrow-left"></i> Back to Explore Manipur</Link></div>
        </main>
        <footer className="footer"><div className="footer-bottom"><span>&copy; 2026 Explore Manipur</span></div></footer>
      </div>
  );
}

