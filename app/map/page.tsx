"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useTripStore } from "@/store/trip";
import { getDestinationImage } from "@/lib/destination-images";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface DestinationData {
  id: string;
  name: string;
  district: string | null;
  category: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
}

function MapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const destinationParam = searchParams.get("destination");
  const itineraryParam = searchParams.get("itinerary");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  const [destination, setDestination] = useState<DestinationData | null>(null);
  const [itineraryDestinations, setItineraryDestinations] = useState<DestinationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [panelOpen, setPanelOpen] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  const isItineraryMode = Boolean(itineraryParam);
  const toggleDestination = useTripStore((s) => s.toggleDestination);
  const selectedIds = useTripStore((s) => s.selectedDestinationIds);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/discover");
    }
  }, [router]);

  const handleCenter = useCallback(() => {
    if (!mapRef.current || !destination) return;
    if (destination.latitude == null || destination.longitude == null) return;
    mapRef.current.setView([destination.latitude, destination.longitude], 13);
  }, [destination]);

  const handleCenterItinerary = useCallback(() => {
    if (!mapRef.current) return;
    const withCoords = itineraryDestinations.filter(
      (d) => d.latitude != null && d.longitude != null
    );
    if (withCoords.length === 0) return;
    if (withCoords.length === 1) {
      mapRef.current.setView([withCoords[0].latitude, withCoords[0].longitude], 13);
    } else {
      const bounds = withCoords.map((d) => [d.latitude as number, d.longitude as number] as [number, number]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [itineraryDestinations]);

  const handleAddToTrip = useCallback(() => {
    if (!destination) return;
    toggleDestination(destination.id);
  }, [destination, toggleDestination]);

  const handleGetDirections = useCallback(() => {
    if (!destination || destination.latitude == null || destination.longitude == null) return;
    setGeoError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const originLat = pos.coords.latitude;
        const originLng = pos.coords.longitude;
        window.open(
          `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${originLat}%2C${originLng}%3B${destination.latitude}%2C${destination.longitude}`,
          "_blank",
          "noopener,noreferrer"
        );
      },
      () => {
        setGeoError("Current location permission is needed for turn-by-turn directions.");
      }
    );
  }, [destination]);

  useEffect(() => {
    if (!destinationParam && !itineraryParam) {
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch("/api/explore?type=destinations");
        if (!res.ok) {
          if (!cancelled) {
            setError("Failed to load destination data.");
            setLoading(false);
          }
          return;
        }
        const json = await res.json();
        if (!json.ok || !Array.isArray(json.data)) {
          if (!cancelled) {
            setError("Failed to load destination data.");
            setLoading(false);
          }
          return;
        }

        if (itineraryParam) {
          const ids = itineraryParam.split(",").filter(Boolean);
          const matched: DestinationData[] = [];
          for (const id of ids) {
            const dest = json.data.find(
              (d: DestinationData) => d.id === id
            );
            if (dest) {
              matched.push(dest);
            }
          }
          if (!cancelled) {
            setItineraryDestinations(matched);
            setLoading(false);
          }
        } else if (destinationParam) {
          const match = json.data.find(
            (d: DestinationData) =>
              d.name.toLowerCase() === destinationParam!.toLowerCase()
          );
          if (!cancelled) {
            if (match) {
              setDestination(match);
            } else {
              setDestination(null);
            }
            setLoading(false);
          }
        }
      } catch {
        if (!cancelled) {
          setError("An error occurred while loading destination data.");
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [destinationParam, itineraryParam]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
      });
    }
  }, []);

  const hasCoordinates = destination?.latitude != null && destination?.longitude != null;
  const lat = destination?.latitude ?? 24.8;
  const lng = destination?.longitude ?? 93.9;
  const isSelected = destination ? selectedIds.includes(destination.id) : false;
  const localImage = destination ? getDestinationImage(destination.name) : null;
  const displayImage = destination?.imageUrl ?? localImage;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#f8f5ed]">
      <header className="absolute top-3 left-3 right-3 z-[1001] flex items-center justify-between px-5 py-3 pointer-events-none md:top-4 md:left-4 md:right-4 md:px-6 md:py-3.5">
        <div className="flex items-center gap-3 pointer-events-auto">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-sm rounded-full text-base font-semibold text-[#173f2b] no-underline shadow-md hover:bg-white transition-colors" style={{ fontFamily: '"Playfair Display", serif' }}>
            Explore Manipur
          </Link>
          <button onClick={handleBack} className="inline-flex items-center gap-1 px-3.5 py-2.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-[#173f2b] border-0 shadow-md cursor-pointer hover:bg-white transition-colors">
            &larr; Back
          </button>
        </div>
        <nav className="hidden items-center gap-2 pointer-events-auto md:flex">
          <Link href="/#experiences" className="px-3 py-2 text-sm font-medium text-[#173f2b]/80 hover:text-[#173f2b] no-underline transition-colors">Experiences</Link>
          <Link href="/discover" className="px-3 py-2 text-sm font-medium text-[#173f2b]/80 hover:text-[#173f2b] no-underline transition-colors">Destinations</Link>
          <Link href="/travel-stay" className="px-3 py-2 text-sm font-medium text-[#173f2b]/80 hover:text-[#173f2b] no-underline transition-colors">Travel &amp; Stay</Link>
          <Link href="/map" className="px-3 py-2 text-sm font-medium text-[#173f2b] no-underline transition-colors">Map</Link>
        </nav>
        <div className="pointer-events-auto">
          <Link href="/plan-trip" className="inline-flex items-center px-5 py-2.5 bg-[#173f2b] text-white rounded-full text-sm font-semibold no-underline shadow-md hover:bg-[#1e5238] transition-colors">
            Plan My Trip &rarr;
          </Link>
        </div>
      </header>

      {!destinationParam && !itineraryParam && (
        <div className="flex items-center justify-center h-full flex-col gap-3">
          <p className="text-sm text-[#66756c]">No destination selected.</p>
        </div>
      )}

      {loading && destinationParam && (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-[#66756c]">Loading map...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-full flex-col gap-3">
          <p className="text-sm text-[#66756c]">{error}</p>
        </div>
      )}

      {!loading && !error && isItineraryMode && (
        <ItineraryView
          itineraryDestinations={itineraryDestinations}
          mapRef={mapRef}
          handleCenterItinerary={handleCenterItinerary}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
        />
      )}

      {!loading && !error && !isItineraryMode && destinationParam && !destination && (
        <div className="flex items-center justify-center h-full flex-col gap-3">
          <p className="text-base font-medium text-[#173f2b]">{destinationParam}</p>
          <p className="text-sm text-[#66756c]">Destination not found in our database.</p>
        </div>
      )}

      {!loading && !error && !isItineraryMode && destination && (
        <>
          {hasCoordinates ? (
            <MapContainer
              ref={mapRef}
              center={[lat, lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[lat, lng]}>
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <strong style={{ fontSize: 13, color: "#173f2b" }}>{destination.name}</strong>
                    {destination.category && (
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#3e584a", textTransform: "uppercase", letterSpacing: "0.04em" }}>{destination.category}</p>
                    )}
                    {destination.district && (
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#66756c" }}>{destination.district}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="w-full h-full bg-[#e8eee9] flex items-center justify-center">
              <p className="text-sm text-[#66756c]">Map unavailable for this destination.</p>
            </div>
          )}

          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="absolute bottom-4 left-4 z-[1002] inline-flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full text-[#173f2b] border-0 shadow-md cursor-pointer text-sm font-bold md:hidden"
          >
            {panelOpen ? "\u2715" : "i"}
          </button>

          {hasCoordinates && (
            <button
              onClick={handleCenter}
              className="absolute bottom-4 right-4 z-[1001] inline-flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-[#173f2b] border-0 shadow-md cursor-pointer hover:bg-white transition-colors hidden md:inline-flex"
            >
              Center
            </button>
          )}

<div className={`absolute bottom-0 left-0 right-0 z-[1001] bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-lg p-5 transition-transform duration-300 max-h-[60vh] overflow-y-auto md:bottom-auto md:left-4 md:right-auto md:top-20 md:w-[380px] md:max-h-[85vh] md:h-fit md:rounded-2xl md:shadow-xl md:p-0 ${panelOpen ? "translate-y-0" : "translate-y-full md:translate-y-0 md:opacity-0 md:pointer-events-none"}`}>
            <div className="md:p-5">
              {displayImage && (
                <div className="w-full h-44 mb-4 rounded-xl overflow-hidden bg-[#e8eee9] hidden md:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={displayImage} alt={destination.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h2 className="m-0 text-xl font-bold text-[#173f2b] leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                {destination.name}
              </h2>
              {destination.category && (
                <p className="mt-1.5 text-[11px] font-semibold tracking-wider text-[#3e584a] uppercase">
                  {destination.category}
                </p>
              )}
              {destination.district && (
                <p className="mt-1 text-xs text-[#66756c]">
                  {destination.district}
                </p>
              )}
              {destination.description && (
                <p className="mt-3 text-sm leading-relaxed text-[#4a5a50] line-clamp-6">
                  {destination.description}
                </p>
              )}
              {hasCoordinates && destination.latitude != null && destination.longitude != null && (
                <p className="mt-2 text-[11px] text-[#66756c] font-mono">
                  {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
                </p>
              )}
              {hasCoordinates && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-[#3e584a]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3e8a5e]" />
                  Verified location
                </p>
              )}
              {!hasCoordinates && (
                <p className="mt-2 text-xs text-[#66756c]">
                  Verified map location unavailable. Coordinates for this destination have not been verified yet.
                </p>
              )}

              {geoError && (
                <p className="mt-3 text-xs font-medium text-[#b45309]">{geoError}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4 pb-1">
                {hasCoordinates && (
                  <button
                    onClick={handleGetDirections}
                    className="inline-flex items-center justify-center px-4 py-2 bg-[#173f2b] text-white rounded-full text-sm font-semibold border-0 cursor-pointer hover:bg-[#1e5238] transition-colors"
                  >
                    Get Directions
                  </button>
                )}
                <button
                  onClick={handleAddToTrip}
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold border-0 cursor-pointer transition-colors ${isSelected ? "bg-[#3e8a5e] text-white" : "bg-[#e8eee9] text-[#173f2b] hover:bg-[#dce5dd]"}`}
                >
                  {isSelected ? "Added to Trip" : "Add to My Trip"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ItineraryView({
  itineraryDestinations,
  mapRef,
  handleCenterItinerary,
  panelOpen,
  setPanelOpen,
}: {
  itineraryDestinations: DestinationData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapRef: React.RefObject<any>;
  handleCenterItinerary: () => void;
  panelOpen: boolean;
  setPanelOpen: (v: boolean) => void;
}) {
  const withCoords = itineraryDestinations.filter(
    (d) => d.latitude != null && d.longitude != null
  );
  const withoutCoords = itineraryDestinations.filter(
    (d) => d.latitude == null || d.longitude == null
  );

  useEffect(() => {
    if (!mapRef.current || withCoords.length === 0) return;
    if (withCoords.length === 1) {
      mapRef.current.setView([withCoords[0].latitude, withCoords[0].longitude], 13);
    } else {
      const bounds = withCoords.map((d) => [d.latitude as number, d.longitude as number] as [number, number]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [itineraryDestinations, mapRef, withCoords]);

  if (itineraryDestinations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-3">
        <p className="text-sm text-[#66756c]">No itinerary destinations found.</p>
      </div>
    );
  }

  const centerLat = withCoords.length > 0
    ? withCoords.reduce((sum, d) => sum + (d.latitude as number), 0) / withCoords.length
    : 24.8;
  const centerLng = withCoords.length > 0
    ? withCoords.reduce((sum, d) => sum + (d.longitude as number), 0) / withCoords.length
    : 93.9;

  const polylinePositions: [number, number][] = withCoords.map(
    (d) => [d.latitude as number, d.longitude as number]
  );

  return (
    <>
      {withCoords.length > 0 ? (
        <MapContainer
          ref={mapRef}
          center={[centerLat, centerLng]}
          zoom={withCoords.length === 1 ? 13 : 9}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {polylinePositions.length >= 2 && (
            <Polyline positions={polylinePositions} pathOptions={{ color: "#173f2b", weight: 3, opacity: 0.7, dashArray: "8, 8" }} />
          )}
          {withCoords.map((d) => (
            <Marker key={d.id} position={[d.latitude as number, d.longitude as number]}>
              <Popup>
                <div style={{ minWidth: 120 }}>
                  <strong style={{ fontSize: 13, color: "#173f2b" }}>{d.name}</strong>
                  {d.category && (
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#3e584a", textTransform: "uppercase" }}>{d.category}</p>
                  )}
                  {d.district && (
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#66756c" }}>{d.district}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="w-full h-full bg-[#e8eee9] flex items-center justify-center">
          <p className="text-sm text-[#66756c]">No destinations with verified coordinates.</p>
        </div>
      )}

      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="absolute bottom-4 left-4 z-[1002] inline-flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full text-[#173f2b] border-0 shadow-md cursor-pointer text-sm font-bold md:hidden"
      >
        {panelOpen ? "\u2715" : "i"}
      </button>

      {withCoords.length > 0 && (
        <button
          onClick={handleCenterItinerary}
          className="absolute bottom-4 right-4 z-[1001] inline-flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-[#173f2b] border-0 shadow-md cursor-pointer hover:bg-white transition-colors hidden md:inline-flex"
        >
          Center
        </button>
      )}

      <div className={`absolute bottom-0 left-0 right-0 z-[1001] bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-lg p-5 transition-transform duration-300 max-h-[55vh] overflow-y-auto md:bottom-auto md:left-4 md:right-auto md:top-20 md:w-[340px] md:max-h-[85vh] md:h-fit md:rounded-2xl md:shadow-xl md:p-0 ${panelOpen ? "translate-y-0" : "translate-y-full md:translate-y-0 md:opacity-0 md:pointer-events-none"}`}>
        <div className="md:p-5">
          <h3 className="m-0 text-lg font-bold text-[#173f2b]" style={{ fontFamily: '"Playfair Display", serif' }}>
            Your Itinerary
          </h3>
          <p className="mt-1 text-xs text-[#66756c]">
            {itineraryDestinations.length} stop{itineraryDestinations.length !== 1 ? "s" : ""}
          </p>
          <ul className="mt-3 p-0 list-none space-y-2.5">
            {itineraryDestinations.map((d, i) => (
              <li key={d.id} className="flex items-start gap-2.5 text-sm text-[#173f2b]">
                <span className="inline-flex items-center justify-center w-6 h-6 text-[11px] font-bold text-white bg-[#173f2b] rounded-full shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-snug">
                  {d.name}
                  {d.latitude == null || d.longitude == null ? (
                    <span className="ml-1 text-[10px] text-[#66756c]">(no coordinates)</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          {withoutCoords.length > 0 && (
            <p className="mt-3 text-[11px] text-[#66756c]">
              {withoutCoords.length} destination{withoutCoords.length !== 1 ? "s" : ""} without verified coordinates.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[1000] bg-[#f8f5ed] flex items-center justify-center">
          <p className="text-sm text-[#66756c]">Loading map...</p>
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
