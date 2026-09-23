"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDestinationImage } from "@/lib/destination-images";


type ApiItem = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  district?: string | null;
  category?: string | null;
};

export default function DiscoverPage() {
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [food, setFood] = useState<ApiItem[]>([]);
  const [events, setEvents] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [fRes, eRes] = await Promise.all([
          fetch("/api/explore?type=food"),
          fetch("/api/explore?type=events"),
        ]);
        if (!cancelled) {
          const fData = fRes.ok ? await fRes.json() : null;
          const eData = eRes.ok ? await eRes.json() : null;
          setFood(fData?.data ?? []);
          setEvents(eData?.data ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function toggleCategory(index: number) {
    setOpenCategory(prev => prev === index ? null : index);
  }

  function toggleItem(index: number) {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <>
      
      <div>
        <header className="navbar">
          <div className="logo">
            <span className="logo-mark">
              <Image src="/images/logo.jpeg" alt="Explore Manipur" width={34} height={34} />
            </span>
            <span>Explore Manipur</span>
          </div>
          <nav className="nav-links">
            <Link href="/#experiences">Experiences</Link>
            <Link href="/#destinations">Destinations</Link>
            <Link href="/map">Map</Link>
          </nav>
          <Link href="/" className="nav-button">
            <i className="fa-solid fa-arrow-left"></i>
            Back Home
          </Link>
        </header>

        <section className="discover-hub-hero">
          <div className="discover-hub-content">
            <span>DISCOVER MANIPUR</span>
            <h1>Stories, traditions<br />and living culture.</h1>
            <p>Explore the traditions, craftsmanship and indigenous practices that make Manipur unique.</p>
          </div>
        </section>

        <main className="discover-dropdown-page">
          <div className="discover-hub-heading">
            <span>EXPLORE</span>
            <h2>Discover what makes<br />Manipur unique.</h2>
          </div>

          <section className={`discover-category${openCategory === 0 ? " open" : ""}`}>
            <button className="category-toggle" onClick={() => toggleCategory(0)}>
              <div>
                <span></span>
                <h3>Art &amp; Culture</h3>
                <p>Classical dance, traditional music, rituals and cultural expressions.</p>
              </div>
              <i className="fa-solid fa-plus"></i>
            </button>
            <div className="category-content">
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/raas-leela.jpeg" alt="Raas Leela" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Raas Leela</h4>
                  <p className="item-preview">Raas Leela is one of the most celebrated classical dance traditions of Manipur, known for its graceful movements and devotional expression.</p>
                  <div className={`item-more${openItems.has(100) ? " show" : ""}`}>
                    <p>Raas Leela is a classical dance form deeply associated with the cultural traditions of Manipur.</p>
                    <p>Its performances portray the divine love between Radha and Krishna through graceful movements, music, expressions and storytelling.</p>
                    <p>The dance remains an important part of Manipuri cultural identity and is recognised for its distinctive style and graceful movement.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(100) ? " open" : ""}`} onClick={() => toggleItem(100)}>
                    {openItems.has(100) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(100) ? "up" : "down"}`}></i>
                  </button>
                  <span className="image-credit">Image credit: Dinesh Sharma</span>
                </div>
              </article>
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/nupa-pala.jpeg" alt="Nupa Pala" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Nupa Pala</h4>
                  <p className="item-preview">Nupa Pala is a traditional Manipuri performance combining music, rhythm, singing and graceful movement.</p>
                  <div className={`item-more${openItems.has(101) ? " show" : ""}`}>
                    <p>Nupa Pala is an important traditional performance of Manipur that combines singing, rhythm and movement.</p>
                    <p>Performers present the tradition through coordinated musical and physical expression, making it an important part of Manipuri performing arts.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(101) ? " open" : ""}`} onClick={() => toggleItem(101)}>
                    {openItems.has(101) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(101) ? "up" : "down"}`}></i>
                  </button>
                  <span className="image-credit">Image credit: Dinesh Sharma</span>
                </div>
              </article>
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/pung-cholom.jpeg" alt="Pung Cholom" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Pung Cholom</h4>
                  <p className="item-preview">Pung Cholom is a dynamic Manipuri performance centred around the traditional drum known as the pung.</p>
                  <div className={`item-more${openItems.has(102) ? " show" : ""}`}>
                    <p>Pung Cholom combines percussion and energetic movement into a distinctive Manipuri performance.</p>
                    <p>Performers play the traditional pung while simultaneously performing rhythmic movements and coordinated sequences.</p>
                    <p>The combination of music, rhythm and movement makes Pung Cholom one of the recognisable performance traditions of Manipur.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(102) ? " open" : ""}`} onClick={() => toggleItem(102)}>
                    {openItems.has(102) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(102) ? "up" : "down"}`}></i>
                  </button>
                  <span className="image-credit">Image credit: Dinesh Sharma</span>
                </div>
              </article>
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/maibi-dance.jpeg" alt="Maibi Dance" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Maibi Dance</h4>
                  <p className="item-preview">Maibi Dance is an important traditional ritual dance associated with the cultural and spiritual traditions of the Meitei people.</p>
                  <div className={`item-more${openItems.has(103) ? " show" : ""}`}>
                    <p>Maibi Dance forms part of traditional ceremonies and rituals and preserves important elements of the cultural heritage of Manipur.</p>
                    <p>The dance is performed by Maibis and uses traditional movements and symbolism connected with the cultural and spiritual traditions of the Meitei community.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(103) ? " open" : ""}`} onClick={() => toggleItem(103)}>
                    {openItems.has(103) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(103) ? "up" : "down"}`}></i>
                  </button>
                  <span className="image-credit">Image credit: Maaibi Dance of the Meiteis at Manipur Sangai Festival</span>
                </div>
              </article>
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/khamba-thoibi.jpeg" alt="Khamba Thoibi Dance" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Khamba Thoibi Dance</h4>
                  <p className="item-preview">Khamba Thoibi is a traditional dance associated with the legendary story of Khamba and Thoibi.</p>
                  <div className={`item-more${openItems.has(104) ? " show" : ""}`}>
                    <p>The performance forms an important part of Manipuri cultural tradition and presents elements of storytelling, graceful movement and traditional expression.</p>
                    <p>The dance is connected with the traditional story of Khamba and Thoibi and continues to be represented through cultural performances.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(104) ? " open" : ""}`} onClick={() => toggleItem(104)}>
                    {openItems.has(104) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(104) ? "up" : "down"}`}></i>
                  </button>
                  <span className="image-credit">Image credit: courtesy Pintu Oinam</span>
                </div>
              </article>
            </div>
          </section>

          <section className={`discover-category${openCategory === 1 ? " open" : ""}`}>
            <button className="category-toggle" onClick={() => toggleCategory(1)}>
              <div>
                <span></span>
                <h3>Handloom</h3>
                <p>Discover the weaving traditions, fabrics and craftsmanship of Manipur.</p>
              </div>
              <i className="fa-solid fa-plus"></i>
            </button>
            <div className="category-content">
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/handloom.jpeg" alt="Manipuri Handloom" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Manipuri Handloom</h4>
                  <p className="item-preview">Manipur enjoys a distinct place amongst the Handloom zones in India. Handloom industry is the largest cottage industry in the State.</p>
                  <div className={`item-more${openItems.has(105) ? " show" : ""}`}>
                    <p>This industry has been flourishing since time immemorial. One of the special features of the industry is that women are the only weavers.</p>
                    <p>According to the National Handloom Census Reports 1988 there are about 2.71 lakh looms in Manipur.</p>
                    <p>It is believed that Chitnu Tamitnu, a goddess, discovered the cotton and she also produced the yarn.</p>
                    <p>When the threads are ready for weaving she arranged the required equipments and constructed the Sinnaishang (work shed).</p>
                    <p>It is also believed that the goddess Panthoibee once saw a spider producing fine threads and making cobwebs and from it she found the idea of weaving and thus started weaving.</p>
                    <p>Most of the weavers who are famous for their skill and intricate designing are from Wangkhei, Bamon Kampu, Kongba, Khongman, Utlou etc. in respect of fine silk items.</p>
                    <p>The rest of the villages of the State produce all varieties of fabrics. Tribal shawls with exotic designs and motifs are products of the hill districts of the State.</p>
                    <p>Fabrics and Shawls of Manipur are in great demand in the national and international market.</p>
                    <p>Today, major handloom production activities are undertaken by three Government organizations namely:</p>
                    <ul>
                      <li>Manipur Development Society (MDS)</li>
                      <li>Manipur Handloom and Handicrafts Development Corporation (MHHDC)</li>
                      <li>Manipur State Handloom Weavers Co-operative Society (MSHWCS)</li>
                    </ul>
                  </div>
                  <button className={`item-read-more${openItems.has(105) ? " open" : ""}`} onClick={() => toggleItem(105)}>
                    {openItems.has(105) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(105) ? "up" : "down"}`}></i>
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section className={`discover-category${openCategory === 2 ? " open" : ""}`}>
            <button className="category-toggle" onClick={() => toggleCategory(2)}>
              <div>
                <span></span>
                <h3>Indigenous Games</h3>
                <p>Traditional sports, martial arts and games passed down through generations.</p>
              </div>
              <i className="fa-solid fa-plus"></i>
            </button>
            <div className="category-content">
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/sagol-kangjei.jpeg" alt="Sagol Kangjei" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Sagol Kangjei</h4>
                  <p className="item-preview">Sagol Kangjei is the traditional form of polo played in Manipur.</p>
                  <div className={`item-more${openItems.has(200) ? " show" : ""}`}>
                    <p>Sagol Kangjei is the traditional form of polo and is associated with the origins of modern polo.</p>
                    <p>Two teams of seven players compete using Manipuri ponies, which are generally around 4-5 feet in height.</p>
                    <p>Players use traditional sticks made from bamboo roots. The game is played in both the Pana and international styles.</p>
                    <p>The game represents an important part of the sporting heritage of Manipur, with Manipuri ponies often decorated for the occasion.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(200) ? " open" : ""}`} onClick={() => toggleItem(200)}>
                    {openItems.has(200) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(200) ? "up" : "down"}`}></i>
                  </button>
                </div>
              </article>
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/yubi-lakpi.jpeg" alt="Yubi Lakpi" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Yubi Lakpi</h4>
                  <p className="item-preview">Yubi Lakpi, meaning coconut snatching, is a distinctive traditional game of Manipur.</p>
                  <div className={`item-more${openItems.has(201) ? " show" : ""}`}>
                    <p>The game is played on a grass field with seven players on each side. A coconut is used as the ball and players attempt to carry it towards the goal.</p>
                    <p>The game has traditionally been associated with palace and temple grounds and remains a distinctive part of Manipuri sporting tradition.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(201) ? " open" : ""}`} onClick={() => toggleItem(201)}>
                    {openItems.has(201) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(201) ? "up" : "down"}`}></i>
                  </button>
                </div>
              </article>
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/hiyang-tannaba.jpeg" alt="Hiyang Tannaba" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Hiyang Tannaba</h4>
                  <p className="item-preview">Hiyang Tannaba is a traditional boat race generally held in November at Thangapat, the historic moat.</p>
                  <div className={`item-more${openItems.has(202) ? " show" : ""}`}>
                    <p>The boats, known as Hiyang Hiren, have spiritual significance and the event is associated with religious rites.</p>
                    <p>Participants traditionally appear in ceremonial dress and headgear, combining sporting activity with cultural and religious traditions.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(202) ? " open" : ""}`} onClick={() => toggleItem(202)}>
                    {openItems.has(202) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(202) ? "up" : "down"}`}></i>
                  </button>
                </div>
              </article>
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/mukna.png" alt="Mukna" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Mukna</h4>
                  <p className="item-preview">Mukna is the traditional wrestling practice of Manipur.</p>
                  <div className={`item-more${openItems.has(203) ? " show" : ""}`}>
                    <p>Competitors test their strength and skill against each other. Wrestlers are matched according to physical build, weight and age.</p>
                    <p>Mukna has long enjoyed popularity and prestige in Manipuri society and has also been associated with royal patronage.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(203) ? " open" : ""}`} onClick={() => toggleItem(203)}>
                    {openItems.has(203) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(203) ? "up" : "down"}`}></i>
                  </button>
                </div>
              </article>
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/kang.jpeg" alt="Kang" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Kang</h4>
                  <p className="item-preview">Kang is a traditional Manipuri game played on a mud floor using a flat oblong object.</p>
                  <div className={`item-more${openItems.has(204) ? " show" : ""}`}>
                    <p>The Kang object was traditionally made from materials such as ivory or lac. Players strike targets during the game.</p>
                    <p>The game can be played in teams of seven and in mixed doubles.</p>
                    <p>The traditional playing period extends from Cheiraoba to Rath Yatra.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(204) ? " open" : ""}`} onClick={() => toggleItem(204)}>
                    {openItems.has(204) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(204) ? "up" : "down"}`}></i>
                  </button>
                </div>
              </article>
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/thang-ta.jpeg" alt="Thang-Ta" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Thang-Ta &amp; Sarit Sarat</h4>
                  <p className="item-preview">Thang-Ta and Sarit Sarat are traditional martial arts passed through generations.</p>
                  <div className={`item-more${openItems.has(205) ? " show" : ""}`}>
                    <p>These traditional martial arts were historically associated with combat skills and physical preparedness during periods of peace.</p>
                    <p>Training emphasises discipline, physical skill and technique.</p>
                    <p>The traditions continue under established customs, rituals and rules passed through generations.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(205) ? " open" : ""}`} onClick={() => toggleItem(205)}>
                    {openItems.has(205) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(205) ? "up" : "down"}`}></i>
                  </button>
                </div>
              </article>
              <article className="culture-item">
                <div className="culture-image"><Image src="/images/other.jpeg" alt="Other Indigenous Games" fill /></div>
                <div className="culture-content">
                  <span className="item-number"></span>
                  <h4>Other Indigenous Games</h4>
                  <p className="item-preview">Manipur has many other traditional games and physical activities that form part of its indigenous sporting heritage.</p>
                  <div className={`item-more${openItems.has(206) ? " show" : ""}`}>
                    <p>Lamjel is a traditional foot race associated with physical endurance and competition.</p>
                    <p>Mangjong is a traditional broad-jump activity that demonstrates physical strength, agility and skill.</p>
                  </div>
                  <button className={`item-read-more${openItems.has(206) ? " open" : ""}`} onClick={() => toggleItem(206)}>
                    {openItems.has(206) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(206) ? "up" : "down"}`}></i>
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section className={`discover-category${openCategory === 3 ? " open" : ""}`}>
            <button className="category-toggle" onClick={() => toggleCategory(3)}>
              <div>
                <span>EXPERIENCE - FOOD</span>
                <h3>Food</h3>
                <p>Discover traditional dishes shaped by seasonal ingredients, local traditions and everyday Manipuri life.</p>
              </div>
              <i className="fa-solid fa-plus"></i>
            </button>
            <div className="category-content">
              {loading && <p style={{ padding: "20px 38px", color: "#66756c", fontSize: 14 }}>Loading food...</p>}
              {!loading && food.length > 0 && food.map((f) => (
                <article key={f.id} className="culture-item">
                  <div className="culture-image">
                    {f.imageUrl || getDestinationImage(f.name) ? <Image src={f.imageUrl || getDestinationImage(f.name)!} alt={f.name} fill /> : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "#dce9df" }}></div>}
                  </div>
                  <div className="culture-content">
                    <span className="item-number"></span>
                    <h4>{f.name}</h4>
                    <p className="item-preview">{f.description ?? ""}</p>
                  </div>
                </article>
              ))}
              {!loading && food.length === 0 && (
                <>
                  <article className="culture-item">
                    <div className="culture-image"><Image src="/images/singju.jpeg" alt="Singju" fill /></div>
                    <div className="culture-content">
                      <span className="item-number"></span>
                      <h4>Singju</h4>
                      <p className="item-preview">A burst of freshness with a fiery Manipuri character, Singju is a traditional salad made with seasonal vegetables, herbs and local ingredients.</p>
                      <div className={`item-more${openItems.has(300) ? " show" : ""}`}>
                        <p>A burst of freshness with a fiery Manipuri character. Singju is a traditional Manipuri salad made with finely sliced seasonal vegetables, herbs and local ingredients such as lotus stem and cabbage.</p>
                        <p>Its distinctive flavour comes from roasted perilla seeds and chickpea flour, or traditionally from ngari (fermented fish). Crunchy, fresh and often spicy, Singju is enjoyed as a snack or accompaniment and reflects Manipur&apos;s love for seasonal produce and bold local flavours.</p>
                      </div>
                      <button className={`item-read-more${openItems.has(300) ? " open" : ""}`} onClick={() => toggleItem(300)}>
                        {openItems.has(300) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(300) ? "up" : "down"}`}></i>
                      </button>
                      <span className="image-credit">Traditional Manipuri cuisine</span>
                    </div>
                  </article>
                  <article className="culture-item">
                    <div className="culture-image"><Image src="/images/chamthong.jpeg" alt="Chamthong" fill /></div>
                    <div className="culture-content">
                      <span className="item-number"></span>
                      <h4>Chamthong / Kangsoi</h4>
                      <p className="item-preview">A simple and comforting vegetable stew rooted in everyday Manipuri cooking, prepared with seasonal greens and locally available ingredients.</p>
                      <div className={`item-more${openItems.has(301) ? " show" : ""}`}>
                        <p>Simple, comforting and deeply rooted in everyday Manipuri cooking. Chamthong, also known as Kangsoi, is a light vegetable stew prepared with seasonal greens and vegetables, onions, herbs, ginger and other local ingredients.</p>
                        <p>It may be finished with dried or fermented fish, giving the broth its characteristic depth. Served hot with rice, this humble dish offers a gentler introduction to Manipuri cuisine while showcasing the importance of fresh, locally available ingredients.</p>
                      </div>
                      <button className={`item-read-more${openItems.has(301) ? " open" : ""}`} onClick={() => toggleItem(301)}>
                        {openItems.has(301) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(301) ? "up" : "down"}`}></i>
                      </button>
                      <span className="image-credit">Traditional Manipuri cuisine</span>
                    </div>
                  </article>
                  <article className="culture-item">
                    <div className="culture-image"><Image src="/images/cha-khao-kheer.png" alt="Chak Hao Kheer" fill /></div>
                    <div className="culture-content">
                      <span className="item-number"></span>
                      <h4>Chak Hao Kheer</h4>
                      <p className="item-preview">A distinctive traditional rice pudding made from Manipur&apos;s aromatic black rice, known locally as Chak-Hao.</p>
                      <div className={`item-more${openItems.has(302) ? " show" : ""}`}>
                        <p>A dessert with a colour as distinctive as its heritage. Chak Hao Kheer is a traditional rice pudding made from Manipur&apos;s aromatic black rice, known locally as Chak-Hao.</p>
                        <p>The naturally dark grains transform into a deep purple shade when cooked, creating a striking dessert with a fragrant, slightly nutty character.</p>
                        <p>Chak-Hao has been cultivated in Manipur for generations and received a Geographical Indication (GI) tag in 2020, making this more than just a dessert - it is a taste of Manipur&apos;s agricultural heritage.</p>
                      </div>
                      <button className={`item-read-more${openItems.has(302) ? " open" : ""}`} onClick={() => toggleItem(302)}>
                        {openItems.has(302) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(302) ? "up" : "down"}`}></i>
                      </button>
                      <span className="image-credit">Traditional Manipuri cuisine</span>
                    </div>
                  </article>
                </>
              )}
            </div>
          </section>

          <section className={`discover-category${openCategory === 4 ? " open" : ""}`}>
            <button className="category-toggle" onClick={() => toggleCategory(4)}>
              <div>
                <span>EXPERIENCE - FESTIVALS</span>
                <h3>Festivals</h3>
                <p>Experience the celebrations, traditions and cultural festivals that bring Manipur to life.</p>
              </div>
              <i className="fa-solid fa-plus"></i>
            </button>
            <div className="category-content">
              {loading && <p style={{ padding: "20px 38px", color: "#66756c", fontSize: 14 }}>Loading events...</p>}
              {!loading && events.length > 0 && events.map((ev) => (
                <article key={ev.id} className="culture-item">
                  <div className="culture-image">
                    {ev.imageUrl || getDestinationImage(ev.name) ? <Image src={ev.imageUrl || getDestinationImage(ev.name)!} alt={ev.name} fill /> : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "#dce9df" }}></div>}
                  </div>
                  <div className="culture-content">
                    <span className="item-number"></span>
                    <h4>{ev.name}</h4>
                    <p className="item-preview">{ev.description ?? ""}</p>
                  </div>
                </article>
              ))}
              {!loading && events.length === 0 && (
                <>
                  <article className="culture-item">
                    <div className="culture-image"><Image src="/images/sangai-festival.jpeg" alt="Sangai Festival" fill /></div>
                    <div className="culture-content">
                      <span className="item-number"></span>
                      <h4>Sangai Festival</h4>
                      <p className="item-preview">A celebration that brings together Manipur&apos;s culture, traditions, crafts, food and performances.</p>
                      <div className={`item-more${openItems.has(400) ? " show" : ""}`}>
                        <p>The Sangai Festival showcases the cultural richness of Manipur through traditional performances, crafts, food and other experiences.</p>
                        <p>It provides an opportunity to experience different aspects of the state&apos;s cultural traditions in one celebration.</p>
                      </div>
                      <button className={`item-read-more${openItems.has(400) ? " open" : ""}`} onClick={() => toggleItem(400)}>
                        {openItems.has(400) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(400) ? "up" : "down"}`}></i>
                      </button>
                      <span className="image-credit">Sangai Festival</span>
                    </div>
                  </article>
                  <article className="culture-item">
                    <div className="culture-image"><Image src="/images/shirui-lily-festival.jpeg" alt="Shirui Lily Festival" fill /></div>
                    <div className="culture-content">
                      <span className="item-number"></span>
                      <h4>Shirui Lily Festival</h4>
                      <p className="item-preview">A celebration centred around the Shirui Lily and the natural and cultural heritage of Ukhrul.</p>
                      <div className={`item-more${openItems.has(401) ? " show" : ""}`}>
                        <p>The Shirui Lily Festival celebrates the natural and cultural identity of Ukhrul, bringing attention to the region and its distinctive landscape.</p>
                        <p>The festival connects nature, local culture, performances and community experiences.</p>
                      </div>
                      <button className={`item-read-more${openItems.has(401) ? " open" : ""}`} onClick={() => toggleItem(401)}>
                        {openItems.has(401) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(401) ? "up" : "down"}`}></i>
                      </button>
                      <span className="image-credit">Shirui Lily Festival</span>
                    </div>
                  </article>
                  <article className="culture-item">
                    <div className="culture-image"><Image src="/images/lai-haraoba.jpeg" alt="Lai Haraoba" fill /></div>
                    <div className="culture-content">
                      <span className="item-number"></span>
                      <h4>Lai Haraoba</h4>
                      <p className="item-preview">An important traditional celebration featuring rituals, music, dance and performances connected with Meitei cultural traditions.</p>
                      <div className={`item-more${openItems.has(402) ? " show" : ""}`}>
                        <p>Lai Haraoba is a traditional celebration associated with the worship of local deities and the preservation of cultural traditions.</p>
                        <p>Rituals, music, dance and performances form an important part of the celebration, connecting cultural practices with community life.</p>
                      </div>
                      <button className={`item-read-more${openItems.has(402) ? " open" : ""}`} onClick={() => toggleItem(402)}>
                        {openItems.has(402) ? "Read Less" : "Read More"} <i className={`fa-solid fa-arrow-${openItems.has(402) ? "up" : "down"}`}></i>
                      </button>
                      <span className="image-credit">Lai Haraoba</span>
                    </div>
                  </article>
                </>
              )}
            </div>
          </section>
        </main>

        <footer className="discover-footer">
          <p>&copy; 2026 Explore Manipur</p>
        </footer>
      </div>
    </>
  );
}
