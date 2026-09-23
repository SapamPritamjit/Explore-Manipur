"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDestinationImage } from "@/lib/destination-images";


type Destination = { id: string; name: string; description?: string | null; imageUrl?: string | null; district?: string | null; category?: string | null };

const STATIC_PLACES = [
  { name: "Ima Keithel", desc: "A symbol of feminine power, Ima Keithel is a more-than-500-year-old all-women's market run by over 3,000 Emas (mothers). It is a popular shopping destination offering a variety of local and traditional goods.", location: "Imphal, Manipur", img: "/images/ima-keithel.jpg", why: ["Experience a unique women-run marketplace","Shop for local and traditional products","Experience everyday Manipuri culture","Explore one of Manipur's most distinctive markets"], tips: ["Best time: Morning–afternoon","Carry cash for smaller purchases","Ask before photographing vendors"] },
  { name: "Shree Shree Govindajee Temple", desc: "A historic centre of the Vaishnavites in Manipur, featuring twin domes covered with gold-plated sheets, a paved courtyard and a large congregation hall. The presiding deity, Radha-Krishna, is carved from a jackfruit tree.", location: "Imphal, Manipur", img: "/images/govindajee.jpg", why: ["Admire its distinctive twin-dome architecture","Experience Manipur's Vaishnavite traditions","Witness daily devotional activities","Experience the temple's traditional vegetarian prasad"], tips: ["Best time: Morning or evening","Dress modestly","Follow temple customs and maintain a respectful atmosphere"] },
  { name: "Andro", desc: "Andro is a historic village near Imphal known for its rich cultural heritage, traditional pottery and preserved indigenous practices. The village is home to the Andro Gramsang Museum, which showcases traditional pottery, artefacts and cultural objects representing different Manipuri tribes.", location: "Andro, Imphal East, Manipur", img: "/images/andro.jpeg", why: ["Explore traditional Manipuri pottery","Visit the Andro Gramsang Museum","Discover indigenous crafts and traditions","Experience the village's cultural heritage"], tips: ["Best time: October–February","Explore the village and museum together","Respect local traditions and cultural spaces"] },
];

export default function HeritagePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/explore?type=destinations").then(r => r.ok ? r.json() : null).then(d => {
      if (!cancelled && d?.data) setDestinations(d.data.filter((x: Destination) => x.category?.toLowerCase().includes("heritage") || x.category?.toLowerCase().includes("culture")));
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
        <section className="nature-hero" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,35,25,.82), rgba(10,35,25,.10)), url("/images/heritage.jpeg")' }}>
          <div className="nature-hero-content"><span>EXPERIENCE • HERITAGE</span><h1>Heritage</h1><p>Discover the traditions, architecture and cultural spaces that preserve the rich heritage of Manipur.</p></div>
        </section>
        <main className="nature-content">
          <div className="nature-heading"><span>HERITAGE OF MANIPUR</span><h2>Stories preserved through generations.</h2></div>
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

