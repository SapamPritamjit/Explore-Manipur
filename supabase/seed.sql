-- Explore Manipur
-- Phase 2: verified tourism seed data.
-- PostgreSQL 15+ (Supabase). Idempotent - safe to re-run.
--
-- Rules followed:
--   * Only facts taken from the recorded source_name/source_url.
--   * Unverified fields (prices, hours, contacts, dates, URLs) are left NULL.
--     Nothing is invented. See DATA_SOURCES.md for the full NULL map.
--   * Districts follow the grouping used on the citing Manipur Tourism page.
--   * Idempotency: rows are inserted only when a like-named row does not exist
--     (the schema has no unique constraints, so ON CONFLICT cannot be used).
--   * Destination latitude/longitude (Phase 10 enrichment) are stored ONLY for
--     the verified subset documented in DATA_SOURCES.md. Every verified
--     coordinate is backed by a cited source recorded in that row's notes.
--     Rows without a verifiable source keep NULL - coordinates are never
--     guessed. The seed-coordinates test guards this rule.
--   * Loaded via SQL tooling (Supabase SQL editor / `supabase db reset`).
--     Never via client-side writes. RLS blocks non-service-role writes anyway.

-- ---------------------------------------------------------------------------
-- destinations
-- ---------------------------------------------------------------------------
-- Only the Phase 10 verified subset carries coordinates (see DATA_SOURCES.md);
-- all other rows keep latitude/longitude NULL.

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Kangla Fort', 'Imphal West', 'Heritage',
  'A historic fortress that was the seat of power of Manipur until 1891. Remains include the outer and inner moats, bricks, and relics reflecting the art and architectural heritage of Manipur.',
  null, null,
  array['fort','heritage','history'],
  24.808, 93.940,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Description and district grouping from the Manipur Tourism district-wise destination page. Coordinates from Wikipedia (https://en.wikipedia.org/wiki/Kangla_Fort).'
where not exists (select 1 from public.destinations where name = 'Kangla Fort');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Shree Shree Govindajee Temple', 'Imphal East', 'Spiritual',
  'A historic Vaishnavite centre adjoining the palace of the former Maharajas of Manipur. The temple has twin domes, a paved courtyard, and a large raised congregation hall, with shrines flanking the main sanctum.',
  null, null,
  array['temple','spiritual','vaishnavism'],
  24.797798, 93.948486,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Listed under the Imphal East section of the Manipur Tourism district-wise destination page. Coordinates from Wikipedia (https://en.wikipedia.org/wiki/Shree_Govindajee_Temple).'
where not exists (select 1 from public.destinations where name = 'Shree Shree Govindajee Temple');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Ima Market (Khwairamband Bazar)', 'Imphal West', 'Shopping',
  'An all-women market of over 3,000 Imas (mothers). One section sells local vegetables, fruits, fishes and household groceries, while the other sells handlooms and household tools.',
  null, null,
  array['market','shopping','local-culture'],
  24.808, 93.935,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Description and the 3,000+ stall count from the Manipur Tourism district-wise destination page. Coordinates from Wikipedia (https://en.wikipedia.org/wiki/Ima_Keithel).'
where not exists (select 1 from public.destinations where name = 'Ima Market (Khwairamband Bazar)');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Manipur State Museum', 'Imphal West', 'Culture',
  'A museum near the Polo Ground exhibiting the tribal heritage of Manipur, including portraits of former rulers, costumes, arms and relics of ancient times.',
  null, null,
  array['museum','culture','history'],
  24.804854, 93.937095,
  'Manipur Tourism', 'https://manipurtourism.gov.in/places-to-see/',
  'Description from the Manipur Tourism places-to-see page. Coordinates from Wikidata (https://www.wikidata.org/wiki/Q110501212).'
where not exists (select 1 from public.destinations where name = 'Manipur State Museum');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Imphal War Cemetery', 'Imphal East', 'Heritage',
  'Cemeteries commemorating British and Indian soldiers who died during World War II, maintained by the Commonwealth War Graves Commission. Small stone markers and bronze plaques carry the soldiers inscriptions.',
  null, null,
  array['war-memorial','world-war-ii','heritage'],
  24.82195, 93.94609,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Description and district grouping from the Manipur Tourism district-wise destination page. Coordinates from the Commonwealth War Graves Commission (https://www.cwgc.org/visit-us/find-cemeteries-memorials/cemetery-details/2064600/imphal-war-cemetery/).'
where not exists (select 1 from public.destinations where name = 'Imphal War Cemetery');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Mutua Museum', 'Imphal East', 'Culture',
  'A cultural complex about 26 km from the Capital housing artifacts of Manipur and the North East including pottery, coins, manuscripts, paintings and wood carvings, with replicas of tribal houses such as those of the Poumai, Kabui, Meitei, Kuki and Tangkhul communities.',
  26, null,
  array['museum','culture','andro'],
  null, null,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Distance (about 26 km from the Capital) from the Manipur Tourism district-wise destination page.'
where not exists (select 1 from public.destinations where name = 'Mutua Museum');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Khonghampat Orchidarium', 'Imphal East', 'Nature',
  'The Central Orchidarium, about 10 km from Imphal on NH-39, covering 200 acres with over 110 varieties of orchids including endemic species. The peak blooming season runs from March to April.',
  10, 'March-April',
  array['orchids','botanical','nature'],
  null, null,
  'Manipur Tourism', 'https://manipurtourism.gov.in/places-to-see/',
  'Distance, acreage, orchid variety count and blooming season from the Manipur Tourism places-to-see page.'
where not exists (select 1 from public.destinations where name = 'Khonghampat Orchidarium');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Manipur Zoological Garden', 'Imphal West', 'Nature',
  'Located at Iroisemba, about 6 km from Imphal on the Imphal-Kangchup road at the foot of pine-covered hillocks. Among various species, the endangered brow-antlered deer (Sangai) can be seen here.',
  6, null,
  array['zoo','wildlife','sangai'],
  24.81694, 93.89111,
  'Manipur Tourism', 'https://manipurtourism.gov.in/places-to-see/',
  'Distance and description from the Manipur Tourism places-to-see page. Coordinates from Wikipedia (https://en.wikipedia.org/wiki/Manipur_Zoological_Garden), corroborated by Wikidata (https://www.wikidata.org/wiki/Q110471174).'
where not exists (select 1 from public.destinations where name = 'Manipur Zoological Garden');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Khongjom War Memorial', 'Thoubal', 'Heritage',
  'A war memorial 36 km from Imphal on the Indo-Myanmar road, marking the spot where Major General Paona Brajabashi fought the advancing British force in 1891. Khongjom Day is observed here every year on 23 April.',
  36, null,
  array['war-memorial','history'],
  null, null,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Distance and Khongjom Day (23 April) from the Manipur Tourism district-wise destination page.'
where not exists (select 1 from public.destinations where name = 'Khongjom War Memorial');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Kakching Garden', 'Kakching', 'Nature',
  'A garden at Uyok Ching on the way to Moreh, grown with native flowers, some herbs and orchids.',
  null, null,
  array['garden','flowers'],
  null, null,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Description from the Manipur Tourism district-wise destination page (Thoubal and Kakching section).'
where not exists (select 1 from public.destinations where name = 'Kakching Garden');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Loktak Lake', 'Bishnupur', 'Nature',
  'The largest fresh-water lake in north-east India, about 48 km from Imphal. From the Tourist Bungalow atop Sendra Island one can overlook life on the lake and its small islands of floating weed. Boating and other water sports are organised at the Takmu Water Sports Complex.',
  48, null,
  array['lake','boating','nature','sendra'],
  24.55, 93.783,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Distance (48 km) from the Manipur Tourism district-wise destination page. Coordinates (representative lake point) from Wikipedia (https://en.wikipedia.org/wiki/Loktak).'
where not exists (select 1 from public.destinations where name = 'Loktak Lake');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Keibul Lamjao National Park', 'Bishnupur', 'Nature',
  'The only floating national park in the world, located on Loktak Lake and the last natural habitat of the Sangai (brow-antlered deer). Other wildlife includes the Hog Deer, Otter and water fowls; migratory birds visit usually between November and March.',
  null, 'November-March (migratory birds)',
  array['national-park','wildlife','sangai','wetland'],
  24.5, 93.76667,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Description and bird season note from the Manipur Tourism district-wise destination page. Coordinates from Wikipedia (https://en.wikipedia.org/wiki/Keibul_Lamjao_National_Park).'
where not exists (select 1 from public.destinations where name = 'Keibul Lamjao National Park');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Moirang', 'Bishnupur', 'Heritage',
  'A town about 45 km from Imphal near Loktak Lake, an early centre of Meitei folk culture with the ancient temple of Lord Thangjing. The INA Museum here commemorates the first unfurling of the Indian National Army flag on 14 April 1944.',
  45, null,
  array['history','ina','museum','culture'],
  24.5, 93.77,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Distance (45 km) and INA flag ceremony date (14 April 1944) from the Manipur Tourism district-wise destination page. Town coordinates from Wikipedia (https://en.wikipedia.org/wiki/Moirang).'
where not exists (select 1 from public.destinations where name = 'Moirang');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Red Hill (Lokpaching)', 'Bishnupur', 'Heritage',
  'A hillock about 16 km from Imphal on the Tiddim Road (NH-150) where British and Japanese forces fought during World War II. The India Peace Memorial here honours Japanese soldiers who lost their lives in the battle.',
  16, null,
  array['world-war-ii','memorial','history'],
  24.703, 93.817,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Distance and description from the Manipur Tourism district-wise destination page. Coordinates from Wikipedia (https://en.wikipedia.org/wiki/Maibam_Lotpa_Ching).'
where not exists (select 1 from public.destinations where name = 'Red Hill (Lokpaching)');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Sadu Chiru Waterfall', 'Bishnupur', 'Nature',
  'A perennial waterfall site about 20 km from Imphal beside the Tiddim Road (NH-150), with three waterfall spots at a scenic foothill.',
  20, null,
  array['waterfall','nature'],
  null, null,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Distance and description from the Manipur Tourism district-wise destination page.'
where not exists (select 1 from public.destinations where name = 'Sadu Chiru Waterfall');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Dzuko Valley', 'Senapati', 'Nature',
  'A green valley in Senapati District bordering Nagaland, famous for the rare Dzuko lily and for snow-covered views around January and February. Mount Iso, the highest peak of Manipur, lies behind the valley.',
  null, 'January-February (snowy)',
  array['valley','trekking','nature','lily'],
  null, null,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Description from the Manipur Tourism district-wise destination page (Senapati section).'
where not exists (select 1 from public.destinations where name = 'Dzuko Valley');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Shirui Hills', 'Ukhrul', 'Nature',
  'Hills in Ukhrul District known for the rare Shirui Lily (Lilium mackliniae), which grows at about 8,500 ft and blooms during May and June.',
  null, 'May-June (Shirui lily bloom)',
  array['hills','lily','nature','trekking'],
  null, null,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Description and bloom season from the Manipur Tourism district-wise destination page (Ukhrul section).'
where not exists (select 1 from public.destinations where name = 'Shirui Hills');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Kangkhui Lime Caves', 'Ukhrul', 'Adventure',
  'Pre-historic limestone caves in Ukhrul District; excavations have revealed evidence of habitation by Stone-Age communities.',
  null, null,
  array['caves','adventure','prehistoric'],
  null, null,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Description from the Manipur Tourism district-wise destination page (Ukhrul section).'
where not exists (select 1 from public.destinations where name = 'Kangkhui Lime Caves');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Tharon Cave', 'Tamenglong', 'Adventure',
  'A cave system in Tamenglong District with about 12 caves underneath, described as the abode of fruit bats and of mystical appearance, suitable for adventure visits.',
  null, null,
  array['caves','adventure'],
  null, null,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Description from the Manipur Tourism district-wise destination page (Tamenglong section).'
where not exists (select 1 from public.destinations where name = 'Tharon Cave');

insert into public.destinations (name, district, category, description, distance_from_imphal, best_time, tags, latitude, longitude, source_name, source_url, notes)
select 'Moreh Border Town', 'Tengnoupal', 'Shopping',
  'A busy commercial town on the Indo-Myanmar border, about 110 km from Imphal; Tamu in Myanmar lies about 5 km away. It is known as a shopping destination for electronics and daily consumables.',
  110, null,
  array['border-town','shopping','moreh'],
  null, null,
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Distance (110 km) and description from the Manipur Tourism district-wise destination page.'
where not exists (select 1 from public.destinations where name = 'Moreh Border Town');

-- ---------------------------------------------------------------------------
-- food
-- ---------------------------------------------------------------------------
-- No specific restaurant could be verified from official sources, so food rows
-- record traditional Manipuri dishes described by two reliable editorial
-- sources (Outlook Traveller, ABP). location/district/models stay NULL.
-- See DATA_SOURCES.md for the note on this decision.

insert into public.food (name, cuisine, local_dishes, tags, source_name, source_url, notes)
select 'Eromba',
  'Manipuri (Meitei)',
  array['eromba','ngari (fermented fish)','umorok (king chilli)'],
  array['traditional','curry','meitei'],
  'Outlook Traveller', 'https://site.outlookindia.com/traveller/cuisine/explore-versatile-world-manipuri-cuisine/',
  'Traditional Meitei dish of mashed boiled vegetables mixed with roasted fermented fish (ngari) and chillies. Recorded as a dish because no specific verified eatery exists in the dataset.'
where not exists (select 1 from public.food where name = 'Eromba');

insert into public.food (name, cuisine, local_dishes, tags, source_name, source_url, notes)
select 'Chamthong (Kangshoi)',
  'Manipuri',
  array['chamthong','kangshoi','seasonal vegetables','ngari'],
  array['stew','traditional'],
  'Outlook Traveller', 'https://site.outlookindia.com/traveller/cuisine/explore-versatile-world-manipuri-cuisine/',
  'Seasonal vegetable stew prepared with ngari, typically eaten as an accompaniment to rice.'
where not exists (select 1 from public.food where name = 'Chamthong (Kangshoi)');

insert into public.food (name, cuisine, local_dishes, tags, source_name, source_url, notes)
select 'Singju',
  'Manipuri',
  array['singju','roasted peas','sesame','ngari'],
  array['snack','salad'],
  'ABP Live', 'https://news.abplive.com/lifestyle/tastes-of-india-a-culinary-journey-through-traditional-dishes-of-manipur-1612924',
  'Spicy chopped-vegetable salad or snack, with ngari-based and thoiding-besan-based varieties.'
where not exists (select 1 from public.food where name = 'Singju');

insert into public.food (name, cuisine, local_dishes, tags, source_name, source_url, notes)
select 'Morok Metpa',
  'Manipuri (Meitei)',
  array['morok metpa','roasted chillies','ngari','garlic'],
  array['chutney','traditional'],
  'Outlook Traveller', 'https://site.outlookindia.com/traveller/cuisine/explore-versatile-world-manipuri-cuisine/',
  'Roasted chilli and garlic chutney pounded with ngari and, in some versions, fermented soybean (hawaijar).'
where not exists (select 1 from public.food where name = 'Morok Metpa');

insert into public.food (name, cuisine, local_dishes, tags, source_name, source_url, notes)
select 'Nga-Thongba',
  'Manipuri',
  array['nga-thongba','fish curry'],
  array['curry','fish'],
  'Outlook Traveller', 'https://site.outlookindia.com/traveller/cuisine/explore-versatile-world-manipuri-cuisine/',
  'Fish curry commonly served at dinner as an accompaniment to rice.'
where not exists (select 1 from public.food where name = 'Nga-Thongba');

insert into public.food (name, cuisine, local_dishes, tags, source_name, source_url, notes)
select 'Ooti',
  'Manipuri',
  array['ooti','green peas','yellow peas'],
  array['stew','vegetarian'],
  'Outlook Traveller', 'https://site.outlookindia.com/traveller/cuisine/explore-versatile-world-manipuri-cuisine/',
  'Vegetarian stew of green or yellow peas, commonly served at Sunday dinner.'
where not exists (select 1 from public.food where name = 'Ooti');

-- ---------------------------------------------------------------------------
-- experiences
-- ---------------------------------------------------------------------------

insert into public.experiences (name, location, district, category, description, best_time, tags, source_name, source_url, notes)
select 'Shirui Hills Trek',
  'Shirui Hills',
  'Ukhrul',
  'Trekking',
  'Trek from the base of the Shirui Hills to the summit, where the endangered Shirui Lily (Lilium mackliniae) blooms on the hill top.',
  'April-June (lily bloom)',
  array['trek','hills','lily'],
  'Manipur Tourism', 'https://manipurtourism.gov.in/shirui-lily-festival/',
  'Manipur Tourism describes trekking to the summit of the Shirui Hills as an exhilarating experience. Trail details, duration and cost are not verified.'
where not exists (select 1 from public.experiences where name = 'Shirui Hills Trek');

insert into public.experiences (name, location, district, category, description, best_time, tags, source_name, source_url, notes)
select 'Boating and water sports at Takmu (Loktak)',
  'Takmu Water Sports Complex, Loktak Lake',
  'Bishnupur',
  'Boating',
  'Boating and other water sports organised at the Takmu Water Sports Complex on Loktak Lake, near Sendra.',
  null,
  array['boating','water-sports','lake'],
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'Mentioned on the Loktak Lake section of the Manipur Tourism district-wise destination page. Timings and cost are not verified.'
where not exists (select 1 from public.experiences where name = 'Boating and water sports at Takmu (Loktak)');

insert into public.experiences (name, location, district, category, description, best_time, tags, source_name, source_url, notes)
select 'Boating at Zailad Lake',
  'Zailad Lake',
  'Tamenglong',
  'Boating',
  'Boating on the legendary Zailad Lake, described by Manipur Tourism as the best spot for boating.',
  null,
  array['boating','lake'],
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'From the Tamenglong section of the Manipur Tourism district-wise destination page. Operators and timings are not verified.'
where not exists (select 1 from public.experiences where name = 'Boating at Zailad Lake');

insert into public.experiences (name, location, district, category, description, best_time, tags, source_name, source_url, notes)
select 'Kangkhui Cave Exploration',
  'Kangkhui',
  'Ukhrul',
  'Adventure',
  'Exploration of prehistoric limestone caves where excavations have found evidence of Stone-Age habitation.',
  null,
  array['caves','adventure','prehistoric'],
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'From the Ukhrul section of the Manipur Tourism district-wise destination page. Guided access and safety details are not verified.'
where not exists (select 1 from public.experiences where name = 'Kangkhui Cave Exploration');

insert into public.experiences (name, location, district, category, description, best_time, tags, source_name, source_url, notes)
select 'Tharon Cave Exploration',
  'Tharon',
  'Tamenglong',
  'Adventure',
  'Visits to the mystical Tharon cave system of about 12 caves, an abode of fruit bats, suited for adventure travellers.',
  null,
  array['caves','adventure'],
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/',
  'From the Tamenglong section of the Manipur Tourism district-wise destination page. Access and safety details are not verified.'
where not exists (select 1 from public.experiences where name = 'Tharon Cave Exploration');

-- ---------------------------------------------------------------------------
-- accommodation
-- ---------------------------------------------------------------------------
-- Taken from the official Manipur Tourism "Find Accommodation" listing.
-- Contact strings mirror the official table. price_range and booking_url are
-- NULL because rates and online booking could not be verified.

insert into public.accommodation (name, district, type, contact, notes, source_name, source_url)
select 'The Classic Hotel', 'Imphal East', 'Hotel',
  '0385-2443969, 0385-2443967, reservation@theclassichotel.in',
  'Listed by Manipur Tourism (Find Accommodation) as a 3 Star hotel with 55 rooms. Rates and online booking are not verified.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/find-accommodation/'
where not exists (select 1 from public.accommodation where name = 'The Classic Hotel');

insert into public.accommodation (name, district, type, contact, notes, source_name, source_url)
select 'Classic Grande', 'Imphal East', 'Hotel',
  '0385-2422139, 0385-2421663, grandereservation@theclassichotel.in',
  'Listed by Manipur Tourism (Find Accommodation) as a 4 Star hotel with 171 rooms. Rates and online booking are not verified.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/find-accommodation/'
where not exists (select 1 from public.accommodation where name = 'Classic Grande');

insert into public.accommodation (name, district, type, contact, notes, source_name, source_url)
select 'Hotel Imphal', 'Imphal East', 'Hotel',
  '0385-2421373, 0385-2422840, 8131962190, imphalreservation@theclassichotel.in',
  'Listed by Manipur Tourism (Find Accommodation) as a 3 Star hotel with 55 rooms. Rates and online booking are not verified.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/find-accommodation/'
where not exists (select 1 from public.accommodation where name = 'Hotel Imphal');

insert into public.accommodation (name, district, type, contact, notes, source_name, source_url)
select 'Sendra Resort', 'Bishnupur', 'Resort',
  '0385-2443969, 0385-2443967, reservation@theclassichotel.in',
  'Listed by Manipur Tourism (Find Accommodation) as a Standard resort with 13 rooms, near Loktak Lake. Rates and online booking are not verified.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/find-accommodation/'
where not exists (select 1 from public.accommodation where name = 'Sendra Resort');

insert into public.accommodation (name, district, type, contact, notes, source_name, source_url)
select 'Hotel Sangai Continental', 'Imphal West', 'Hotel',
  '0385-2441584, 0385-2441585, 0385-2441595',
  'Listed by Manipur Tourism (Find Accommodation) as a Standard hotel with 49 rooms. Rates and online booking are not verified.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/find-accommodation/'
where not exists (select 1 from public.accommodation where name = 'Hotel Sangai Continental');

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
-- Only dates that are explicitly verifiable from the cited pages are set.
-- Sangai Festival dates for the next edition are not yet published, so its
-- start/end/year columns stay NULL with a descriptive note.

insert into public.events (name, category, start_date, end_date, year, annual_or_one_time, location, district, description, organizer, official_url, notes, source_name, source_url)
select 'Manipur Sangai Festival',
  'Festival',
  null, null, null,
  'annual',
  null, null,
  'The annual flagship cultural festival of Manipur, showcasing dance, music, arts, cuisine and handloom across multiple venues.',
  null,
  'https://manipurtourism.gov.in/manipur-sangai-festival-2025-programme/',
  'Held annually in Imphal. Manipur Tourism published a 2025 programme; dates for the next edition are not yet verified, so date columns are NULL.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/manipur-sangai-festival-2025-programme/'
where not exists (select 1 from public.events where name = 'Manipur Sangai Festival');

insert into public.events (name, category, start_date, end_date, year, annual_or_one_time, location, district, description, organizer, official_url, notes, source_name, source_url)
select 'Shirui Lily Festival',
  'Festival',
  date '2025-05-20', date '2025-05-24', 2025,
  'annual',
  'Multiple venues in Ukhrul (Shirui Village, TNL Ground, Phangrei, Bakshi Ground)',
  'Ukhrul',
  'A state-level festival celebrating the endangered Shirui Lily with cultural performances, music, games, joyrides and treks.',
  'Department of Tourism, Manipur',
  'https://manipurtourism.gov.in/shirui-lily-festival/',
  'The 5th State-Level edition was held 20-24 May 2025. The festival is annual in May; 2026 dates are not yet verified.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/shirui-lily-festival/'
where not exists (select 1 from public.events where name = 'Shirui Lily Festival');

insert into public.events (name, category, start_date, end_date, year, annual_or_one_time, location, district, description, organizer, official_url, notes, source_name, source_url)
select 'Khongjom Day',
  'Commemoration',
  null, null, null,
  'annual',
  'Khongjom War Memorial',
  'Thoubal',
  'Annual commemoration held at the Khongjom War Memorial in memory of Major General Paona Brajabashi and the Battle of Khongjom.',
  null,
  null,
  'Observed every year on 23 April per the Manipur Tourism district-wise destination page. Yearly edition dates are not tracked, so date columns are NULL.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/'
where not exists (select 1 from public.events where name = 'Khongjom Day');

insert into public.events (name, category, start_date, end_date, year, annual_or_one_time, location, district, description, organizer, official_url, notes, source_name, source_url)
select 'Moirang Lai Haraoba',
  'Religious festival',
  null, null, null,
  'annual',
  'Moirang (Lord Thangjing temple)',
  'Bishnupur',
  'A ritual dance festival helconda activate iad at Moirang in honour of Lord Thangjing, with dances and songs depicting Meitei folklore.',
  null,
  null,
  'Held every year in the month of May per the Manipur Tourism district-wise destination page. Exact yearly dates are not verified, so date columns are NULL.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/'
where not exists (select 1 from public.events where name = 'Moirang Lai Haraoba');

-- ---------------------------------------------------------------------------
-- transport
-- ---------------------------------------------------------------------------
-- Distances are the approximate road distances stated by Manipur Tourism and
-- are estimates, not live routing data. approx_time is NULL everywhere because
-- travel times were not verified.

insert into public.transport (origin, destination, transport_type, approx_distance, notes, source_name, source_url)
select 'Imphal', 'Loktak Lake', 'Road', 48,
  'Road distance from Imphal as stated by Manipur Tourism. Travel time is not verified, so approx_time is NULL.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/'
where not exists (select 1 from public.transport where origin = 'Imphal' and destination = 'Loktak Lake' and transport_type = 'Road');

insert into public.transport (origin, destination, transport_type, approx_distance, notes, source_name, source_url)
select 'Imphal', 'Moirang', 'Road', 45,
  'Road distance from Imphal as stated by Manipur Tourism. Travel time is not verified, so approx_time is NULL.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/'
where not exists (select 1 from public.transport where origin = 'Imphal' and destination = 'Moirang' and transport_type = 'Road');

insert into public.transport (origin, destination, transport_type, approx_distance, notes, source_name, source_url)
select 'Imphal', 'Moreh', 'Road', 110,
  'Road distance from Imphal as stated by Manipur Tourism. Travel time is not verified, so approx_time is NULL.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/'
where not exists (select 1 from public.transport where origin = 'Imphal' and destination = 'Moreh' and transport_type = 'Road');

insert into public.transport (origin, destination, transport_type, approx_distance, notes, source_name, source_url)
select 'Imphal', 'Tamenglong', 'Road', 156,
  'Road distance from Imphal as stated by Manipur Tourism. Travel time is not verified, so approx_time is NULL.',
  'Manipur Tourism', 'https://manipurtourism.gov.in/district-wise-destination/'
where not exists (select 1 from public.transport where origin = 'Imphal' and destination = 'Tamenglong' and transport_type = 'Road');