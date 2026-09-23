export interface DemoDestination {
  id: string;
  name: string;
  district: string;
  category: string;
  description: string;
  tags: string[];
  demoScore: number;
}

export interface DemoFood {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  tags: string[];
}

export interface DemoExperience {
  id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  tags: string[];
}

export interface DemoAccommodation {
  id: string;
  name: string;
  district: string;
  type: string;
}

export const demoDestinations: DemoDestination[] = [
  {
    id: "demo-dest-1",
    name: "Loktak Lake",
    district: "Bishnupur",
    category: "Nature",
    description:
      "The largest fresh-water lake in north-east India, known for its floating islands and scenic views from Sendra.",
    tags: ["lake", "boating", "nature"],
    demoScore: 95,
  },
  {
    id: "demo-dest-2",
    name: "Kangla Fort",
    district: "Imphal West",
    category: "Heritage",
    description:
      "A historic fortress that was the seat of power of Manipur until 1891, with moats and relics reflecting ancient art and architecture.",
    tags: ["fort", "heritage", "history"],
    demoScore: 92,
  },
  {
    id: "demo-dest-3",
    name: "Keibul Lamjao National Park",
    district: "Bishnupur",
    category: "Nature",
    description:
      "The only floating national park in the world, located on Loktak Lake and the last natural habitat of the Sangai deer.",
    tags: ["national-park", "wildlife", "wetland"],
    demoScore: 88,
  },
  {
    id: "demo-dest-4",
    name: "Shree Shree Govindajee Temple",
    district: "Imphal East",
    category: "Spiritual",
    description:
      "A historic Vaishnavite centre adjoining the former Maharajas' palace, featuring twin domes and a large congregation hall.",
    tags: ["temple", "spiritual", "culture"],
    demoScore: 85,
  },
  {
    id: "demo-dest-5",
    name: "Manipur State Museum",
    district: "Imphal West",
    category: "Culture",
    description:
      "A museum near the Polo Ground exhibiting tribal heritage, portraits of former rulers, costumes, arms and ancient relics.",
    tags: ["museum", "culture", "history"],
    demoScore: 82,
  },
  {
    id: "demo-dest-6",
    name: "Ima Market (Khwairamband Bazar)",
    district: "Imphal West",
    category: "Shopping",
    description:
      "An all-women market of over 3,000 Imas selling local produce, handlooms and household goods.",
    tags: ["market", "shopping", "local-culture"],
    demoScore: 90,
  },
  {
    id: "demo-dest-7",
    name: "Dzuko Valley",
    district: "Senapati",
    category: "Nature",
    description:
      "A green valley bordering Nagaland, famous for the rare Dzuko lily and snow-covered views in winter.",
    tags: ["valley", "trekking", "nature"],
    demoScore: 87,
  },
  {
    id: "demo-dest-8",
    name: "Khongjom War Memorial",
    district: "Thoubal",
    category: "Heritage",
    description:
      "A war memorial marking where Major General Paona Brajabashi fought the British forces in 1891.",
    tags: ["war-memorial", "history"],
    demoScore: 78,
  },
  {
    id: "demo-dest-9",
    name: "Shirui Hills",
    district: "Ukhrul",
    category: "Nature",
    description:
      "Hills known for the rare Shirui Lily which grows at about 8,500 ft and blooms during May and June.",
    tags: ["hills", "nature", "trekking"],
    demoScore: 84,
  },
  {
    id: "demo-dest-10",
    name: "Kangkhui Lime Caves",
    district: "Ukhrul",
    category: "Adventure",
    description:
      "Pre-historic limestone caves where excavations revealed evidence of Stone-Age habitation.",
    tags: ["caves", "adventure", "prehistoric"],
    demoScore: 80,
  },
];

export const demoFood: DemoFood[] = [
  {
    id: "demo-food-1",
    name: "Eromba",
    cuisine: "Manipuri (Meitei)",
    description: "Mashed boiled vegetables mixed with roasted fermented fish and chillies.",
    tags: ["traditional", "curry"],
  },
  {
    id: "demo-food-2",
    name: "Singju",
    cuisine: "Manipuri",
    description: "Spicy chopped-vegetable salad with roasted peas and sesame.",
    tags: ["snack", "salad"],
  },
  {
    id: "demo-food-3",
    name: "Chamthong (Kangshoi)",
    cuisine: "Manipuri",
    description: "Seasonal vegetable stew typically eaten as an accompaniment to rice.",
    tags: ["stew", "traditional"],
  },
  {
    id: "demo-food-4",
    name: "Morok Metpa",
    cuisine: "Manipuri (Meitei)",
    description: "Roasted chilli and garlic chutney pounded with fermented fish.",
    tags: ["chutney", "traditional"],
  },
];

export const demoExperiences: DemoExperience[] = [
  {
    id: "demo-exp-1",
    name: "Shirui Hills Trek",
    location: "Shirui Hills, Ukhrul",
    category: "Trekking",
    description: "Trek to the summit where the endangered Shirui Lily blooms.",
    tags: ["trek", "hills"],
  },
  {
    id: "demo-exp-2",
    name: "Boating at Takmu (Loktak)",
    location: "Takmu Water Sports Complex, Loktak Lake",
    category: "Boating",
    description: "Boating and water sports on Loktak Lake near Sendra.",
    tags: ["boating", "water-sports", "lake"],
  },
  {
    id: "demo-exp-3",
    name: "Kangkhui Cave Exploration",
    location: "Kangkhui, Ukhrul",
    category: "Adventure",
    description: "Explore prehistoric limestone caves with Stone-Age history.",
    tags: ["caves", "adventure"],
  },
];

export const demoAccommodation: DemoAccommodation[] = [
  {
    id: "demo-acc-1",
    name: "Classic Grande",
    district: "Imphal East",
    type: "Hotel",
  },
  {
    id: "demo-acc-2",
    name: "Sendra Resort",
    district: "Bishnupur",
    type: "Resort",
  },
  {
    id: "demo-acc-3",
    name: "Hotel Sangai Continental",
    district: "Imphal West",
    type: "Hotel",
  },
];
