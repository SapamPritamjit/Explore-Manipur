"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDestinationImage } from "@/lib/destination-images";


type FoodItem = { id: string; name: string; description?: string | null; imageUrl?: string | null };

const STATIC_FOOD = [
  { name: "Singju", preview: "A burst of freshness with a fiery Manipuri character. Singju is a traditional Manipuri salad made with finely sliced seasonal vegetables, herbs and local ingredients.", more: ["Singju is a traditional Manipuri salad made with finely sliced seasonal vegetables, herbs and local ingredients such as lotus stem and cabbage.","Its distinctive flavour comes from roasted perilla seeds and chickpea flour, or traditionally from ngari (fermented fish).","Crunchy, fresh and often spicy, Singju is enjoyed as a snack or accompaniment and reflects Manipur's love for seasonal produce and bold local flavours."], img: "/images/singju.jpeg" },
  { name: "Chamthong / Kangsoi", preview: "Simple, comforting and deeply rooted in everyday Manipuri cooking. Chamthong is a light vegetable stew prepared with seasonal greens and vegetables.", more: ["Chamthong, also known as Kangsoi, is a light vegetable stew prepared with seasonal greens and vegetables, onions, herbs, ginger and other local ingredients.","It may be finished with dried or fermented fish, giving the broth its characteristic depth.","Served hot with rice, this humble dish offers a gentler introduction to Manipuri cuisine while showcasing the importance of fresh, locally available ingredients."], img: "/images/chamthong.jpeg" },
  { name: "Chak Hao Kheer", preview: "A dessert with a colour as distinctive as its heritage. Chak Hao Kheer is a traditional rice pudding made from Manipur's aromatic black rice.", more: ["Chak Hao Kheer is a traditional rice pudding made from Manipur's aromatic black rice, known locally as Chak-Hao.","The naturally dark grains transform into a deep purple shade when cooked, creating a striking dessert with a fragrant, slightly nutty character.","Chak-Hao has been cultivated in Manipur for generations and received a Geographical Indication (GI) tag in 2020."], img: "/images/cha-khao-kheer.png" },
];

export default function FoodPage() {
  const [food, setFood] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/explore?type=food").then(r => r.ok ? r.json() : null).then(d => {
      if (!cancelled && d?.data) setFood(d.data);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const items = food.length > 0 ? food.map(f => ({ name: f.name, preview: f.description ?? "", more: [], img: f.imageUrl || getDestinationImage(f.name) || "" })) : STATIC_FOOD;

  return (
    <>
      
      <div>
        <header className="navbar">
          <div className="logo"><span className="logo-mark"><Image src="/images/logo.jpeg" alt="Explore Manipur" width={34} height={34} /></span><span>Explore Manipur</span></div>
          <nav className="nav-links"><Link href="/#experiences">Experiences</Link><Link href="/#destinations">Destinations</Link><Link href="/#map">Map</Link></nav>
          <Link href="/" className="nav-button"><i className="fa-solid fa-arrow-left"></i> Back Home</Link>
        </header>
        <section className="food-hub-hero">
          <div className="food-hub-content"><span>EXPERIENCE • FOOD</span><h1>Taste the<br />flavours of Manipur.</h1><p>Discover traditional dishes shaped by seasonal ingredients, local traditions and the flavours of everyday Manipuri life.</p></div>
        </section>
        <main className="food-page">
          <div className="food-heading"><span>MANIPURI CUISINE</span><h2>A taste of<br />Manipur.</h2><p>Explore traditional dishes that reflect Manipur&apos;s relationship with seasonal produce, local ingredients and generations of culinary tradition.</p></div>
          {loading && <p style={{ color: "#66756c", padding: "20px 0" }}>Loading...</p>}
          {!loading && items.map((item, i) => (
            <section key={i} className={`food-category${openCategory === i ? " open" : ""}`}>
              <button className="food-toggle" onClick={() => setOpenCategory(openCategory === i ? null : i)}>
                <div><span></span><h3>{item.name}</h3><p>{item.preview}</p></div>
                <i className="fa-solid fa-plus"></i>
              </button>
              <div className="food-content">
                <article className="food-item">
                  <div className="food-image">{item.img ? <Image src={item.img} alt={item.name} fill /> : <div style={{ width:"100%",height:"100%",background:"#dce9df" }}></div>}</div>
                  <div className="food-text">
                    <h4>{item.name}</h4>
                    <p className="food-preview">{item.preview}</p>
                    <div className={`food-more${openItems.has(i) ? " show" : ""}`}>
                      {(item.more.length > 0 ? item.more : [item.preview]).map((p, j) => (<p key={j}>{p}</p>))}
                    </div>
                    <button className={`food-read-more${openItems.has(i) ? " open" : ""}`} onClick={() => setOpenItems(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}>
                      {openItems.has(i) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(i) ? "up" : "down"}`}></i>
                    </button>
                    <span className="image-credit">Traditional Manipuri cuisine</span>
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
