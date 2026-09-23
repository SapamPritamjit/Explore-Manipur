"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDestinationImage } from "@/lib/destination-images";


type Destination = { id: string; name: string; description?: string | null; imageUrl?: string | null; district?: string | null; category?: string | null };

const STATIC_PLACES = [
  { name: "Shirui Hills", desc: "Home to the rare Shirui Lily, found only in the Siroy Hill Range of Ukhrul. The hills offer beautiful landscapes and a rewarding trekking experience.", location: "Ukhrul District, Manipur", img: "/images/shirui.jpg", why: ["Trek through beautiful mountain landscapes","See the rare Shirui Lily","Enjoy panoramic views of the surrounding hills","Experience one of Manipur's iconic trekking destinations"], tips: ["Wear proper trekking shoes","Carry sufficient water","Check weather conditions before trekking"] },
  { name: "Dzükou Valley", desc: "Located near the Manipur–Nagaland border, Dzükou Valley is famous for its seasonal flowers and breathtaking green landscapes. It is also one of the region's popular trekking destinations.", location: "Senapati District, Manipur", img: "/images/dzukou.jpg", why: ["Experience scenic valley landscapes","Explore seasonal flowers and vegetation","Take on a rewarding trekking route","Enjoy peaceful mountain surroundings"], tips: ["Wear comfortable trekking footwear","Carry water and basic trekking essentials","Check local weather and trail conditions"] },
  { name: "Tharon Cave", desc: "Located near Tamenglong, Tharon Cave is a fascinating natural cave system believed to have been used as shelter thousands of years ago. Excavations have also revealed artefacts associated with the Hoabinhian culture of North Vietnam.", location: "Near Tamenglong, Tamenglong District, Manipur", img: "/images/tharon.png", why: ["Explore a fascinating natural cave system","Discover the area's archaeological significance","Experience a less-explored side of Manipur","Combine adventure with cultural exploration"], tips: ["Wear sturdy footwear","Carry a flashlight and essential supplies","Explore with local guidance where appropriate"] },
];

export default function AdventurePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/explore?type=destinations").then(r => r.ok ? r.json() : null).then(d => {
      if (!cancelled && d?.data) setDestinations(d.data.filter((x: Destination) => x.category?.toLowerCase().includes("adventure") || x.category?.toLowerCase().includes("trek")));
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const places = destinations.length > 0 ? destinations.map(d => ({ name: d.name, desc: d.description ?? "", location: d.district ?? "", img: d.imageUrl || getDestinationImage(d.name) || "", why: [], tips: [] })) : STATIC_PLACES;

  return (
      <div className="nature-page">
        <header className="navbar">
          <div className="logo"><span className="logo-mark"><Image src="/images/logo.jpeg" alt="Explore Manipur" width={34} height={34} /></span><span>Explore Manipur</span></div>
          <nav className="nav-links"><Link href="/#experiences">Experiences</Link><Link href="/#destinations">Destinations</Link><Link href="/#map">Map</Link></nav>
          <Link href="/" className="nav-button"><i className="fa-solid fa-arrow-left"></i> Back Home</Link>
        </header>
        <section className="nature-hero" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,35,25,.82), rgba(10,35,25,.10)), url("/images/adventure.png")' }}>
          <div className="nature-hero-content"><span>EXPERIENCE • ADVENTURE</span><h1>Adventure</h1><p>Trek through mountain landscapes, explore hidden caves and experience the adventurous side of Manipur.</p></div>
        </section>
        <main className="nature-content">
          <div className="nature-heading"><span>ADVENTURE IN MANIPUR</span><h2>Trails worth taking.</h2></div>
          {loading && <p style={{ color: "#66756c" }}>Loading...</p>}
          {!loading && places.map((p, i) => (
            <article key={i} className={`nature-place${i % 2 === 1 ? " reverse" : ""}`}>
              <div className="nature-image">{p.img ? <Image src={p.img} alt={p.name} fill /> : <div style={{ width:"100%",height:"100%",background:"#dce9df" }}></div>}</div>
              <div className="nature-info">
                <span className="nature-number"></span>
                <h3>{p.name}</h3>
                <p className="nature-description">{p.desc}</p>
                <div className="nature-location"><i className="fa-solid fa-location-dot"></i><span>{p.location}</span></div>
                <Link href={`/map?destination=${encodeURIComponent(p.name)}`} className="map-link"><i className="fa-solid fa-map-location-dot"></i> View on Map <i className="fa-solid fa-arrow-right"></i></Link>
                {p.why.length > 0 && <><h4>WHY VISIT?</h4><ul className="nature-list">{p.why.map((w,j)=><li key={j}>{w}</li>)}</ul></>}
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

