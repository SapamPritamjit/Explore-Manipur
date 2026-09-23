"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDestinationImage } from "@/lib/destination-images";


type EventItem = { id: string; name: string; description?: string | null; imageUrl?: string | null };

const STATIC_FESTIVALS = [
  { name: "Sangai Festival", preview: "The Sangai Festival is a ten-day celebration of Manipur's rich cultural heritage, held annually from 21–30 November.", more: ["The Sangai Festival is a ten-day celebration of Manipur's rich cultural heritage, held annually from 21–30 November and named after the rare brow-antlered deer found exclusively in the state.","First introduced in 2010, the festival has grown into a major showcase of Manipur's diverse traditions and communities, bringing together art, music, dance, cuisine, handicrafts, indigenous sports and adventure experiences.","Visitors can witness classical and folk performances such as Ras Leela, Maibi and Khamba Thoibi, explore traditional handlooms and handicrafts, and experience indigenous sports including Thang-Ta, Yubi-Lakpi, Mukna Kangjei and Sagol Kangjei.","The festival also offers an opportunity to discover Manipuri cuisine, with traditional dishes prepared using local and indigenous ingredients.","Named after Manipur's state animal, the Sangai Festival also highlights the importance of the state's natural heritage and biodiversity, making it an immersive introduction to the culture, creativity and traditions of Manipur."], img: "/images/sangai-festival.jpeg" },
  { name: "Shirui Lily Festival", preview: "The Shirui Lily Festival celebrates nature, culture and adventure around the rare and endangered Shirui Lily of Ukhrul.", more: ["The Shirui Lily Festival is a celebration of nature, culture and adventure centred around the rare and endangered Shirui Lily (Lilium mackliniae), which grows naturally in the Shirui Hills of Ukhrul.","Held during the flower's peak blooming season, the festival brings visitors to one of Manipur's most distinctive hill landscapes while highlighting the ecological importance of the Shirui Lily and the cultural heritage of the indigenous Tangkhul Naga community.","The multi-day celebration features traditional and cultural performances, indigenous games, art and craft exhibitions, local cuisine and traditional weaving, alongside outdoor experiences such as trekking, camping and biking.","Music is also a major part of the festival, with the popular SHIROCK bringing performances across rock, metal, pop and other contemporary genres.","Events such as the Shirui Lily Literature Festival, culinary competitions and other cultural activities add to the experience, making it an opportunity to explore Ukhrul through its landscapes, people, traditions and creative expressions."], img: "/images/shirui-lily-festival.jpeg" },
  { name: "Lai Haraoba", preview: "Lai Haraoba, meaning the \"merrymaking of the gods\", is an important traditional festival of the Meitei people of Manipur.", more: ["Lai Haraoba, meaning the \"merrymaking of the gods\", is one of the important traditional festivals of the Meitei people of Manipur, preserving rituals, beliefs, music and performing arts that have been passed down through generations.","The festival is associated with the Umang Lai, the traditional deities worshipped by communities, and is celebrated at different locations across Manipur, with the timing and duration varying from one celebration to another.","At the heart of Lai Haraoba are elaborate rituals and performances that symbolically recount the creation of the world and aspects of traditional Meitei life.","The Maibis, traditional priestesses, play a central role through dances that portray creation, everyday occupations and the way of life of earlier generations, accompanied by traditional music and ceremonies.","The Moirang Lai Haraoba, dedicated to the deity Thangjing, is among the best-known celebrations and is closely connected with the legendary Khamba and Thoibi tradition.","For visitors, Lai Haraoba offers an opportunity to experience Manipur's living cultural heritage through its rituals, dances, music, stories and community traditions."], img: "/images/lai-haraoba.jpeg" },
];

export default function FestivalsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/explore?type=events").then(r => r.ok ? r.json() : null).then(d => {
      if (!cancelled && d?.data) setEvents(d.data);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const items = events.length > 0 ? events.map(e => ({ name: e.name, preview: e.description ?? "", more: [], img: e.imageUrl || getDestinationImage(e.name) || "" })) : STATIC_FESTIVALS;

  return (
    <>
      
      <div>
        <header className="navbar">
          <div className="logo"><span className="logo-mark"><Image src="/images/logo.jpeg" alt="Explore Manipur" width={34} height={34} /></span><span>Explore Manipur</span></div>
          <nav className="nav-links"><Link href="/#experiences">Experiences</Link><Link href="/#destinations">Destinations</Link><Link href="/#map">Map</Link></nav>
          <Link href="/" className="nav-button"><i className="fa-solid fa-arrow-left"></i> Back Home</Link>
        </header>
        <section className="festival-hub-hero">
          <div className="festival-hub-content"><span>EXPERIENCE • FESTIVALS</span><h1>Celebrate the<br />spirit of Manipur.</h1><p>Discover festivals that bring together Manipur&apos;s culture, traditions, nature, music and communities.</p></div>
        </section>
        <main className="festival-page">
          <div className="festival-heading"><span>FESTIVALS</span><h2>Experience Manipur<br />through its celebrations.</h2><p>From cultural celebrations to festivals inspired by nature, discover some of the traditions and events that make Manipur unique.</p></div>
          {loading && <p style={{ color: "#66756c", padding: "20px 0" }}>Loading...</p>}
          {!loading && items.map((item, i) => (
            <section key={i} className={`festival-category${openCategory === i ? " open" : ""}`}>
              <button className="festival-toggle" onClick={() => setOpenCategory(openCategory === i ? null : i)}>
                <div><span></span><h3>{item.name}</h3><p>{item.preview}</p></div>
                <i className="fa-solid fa-plus"></i>
              </button>
              <div className="festival-content">
                <article className="festival-item">
                  <div className="festival-image">{item.img ? <Image src={item.img} alt={item.name} fill /> : <div style={{ width:"100%",height:"100%",background:"#dce9df" }}></div>}</div>
                  <div className="festival-text">
                    <h4>{item.name}</h4>
                    <p className="festival-preview">{item.preview}</p>
                    <div className={`festival-more${openItems.has(i) ? " show" : ""}`}>
                      {(item.more.length > 0 ? item.more : [item.preview]).map((p, j) => (<p key={j}>{p}</p>))}
                    </div>
                    <button className={`festival-read-more${openItems.has(i) ? " open" : ""}`} onClick={() => setOpenItems(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}>
                      {openItems.has(i) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(i) ? "up" : "down"}`}></i>
                    </button>
                    <span className="image-credit">Festival organisers / source</span>
                  </div>
                </article>
              </div>
            </section>
          ))}
        </main>
        <footer className="discover-footer"><p>&copy; 2026 Explore Manipur</p></footer>
      </div>
    </>
  );
}