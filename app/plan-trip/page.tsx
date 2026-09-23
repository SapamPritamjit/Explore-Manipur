"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/ui/nav";
import { useTripStore } from "@/store/trip";
import type { TripPlanResponse } from "@/store/trip";

const INTERESTS = [
  "Nature",
  "Culture",
  "History",
  "Food",
  "Adventure",
  "Wildlife",
  "Festivals",
  "Shopping",
] as const;

export default function PlanTripPage() {
  const router = useRouter();
  const setTripPlan = useTripStore((s) => s.setTripPlan);

  const [durationDays, setDurationDays] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [startingLocation, setStartingLocation] = useState("");
  const [geoLat, setGeoLat] = useState<number | null>(null);
  const [geoLng, setGeoLng] = useState<number | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "detected" | "denied" | "unsupported">("idle");
  const [dailyHours, setDailyHours] = useState("8");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  function handleUseCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLat(pos.coords.latitude);
        setGeoLng(pos.coords.longitude);
        setGeoStatus("detected");
      },
      () => {
        setGeoStatus("denied");
      }
    );
  }

  function validate(): string[] {
    const errors: string[] = [];
    const days = Number(durationDays);
    if (!durationDays.trim() || isNaN(days) || days < 1) {
      errors.push("Trip duration must be at least 1 day.");
    }
    if (budget.trim()) {
      const b = Number(budget);
      if (isNaN(b) || b < 0) {
        errors.push("Budget must be a non-negative number.");
      }
    }
    if (dailyHours.trim()) {
      const h = Number(dailyHours);
      if (isNaN(h) || h <= 0) {
        errors.push("Daily available hours must be greater than 0.");
      }
    }
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);

    const vErrors = validate();
    if (vErrors.length > 0) {
      setValidationErrors(vErrors);
      return;
    }

    setLoading(true);

    const trimmedLocation = startingLocation.trim();
    const useGeo = geoStatus === "detected" && geoLat != null && geoLng != null;

    const body: Record<string, unknown> = {
      tripDurationDays: Number(durationDays),
      interests: interests.map((i) => i.toLowerCase()),
    };

    if (useGeo) {
      body.startingLocation = "Current location";
      body.startingLatitude = geoLat;
      body.startingLongitude = geoLng;
    } else if (trimmedLocation) {
      body.startingLocation = trimmedLocation;
    }

    if (budget.trim()) {
      body.budget = Number(budget);
    }
    if (dailyHours.trim()) {
      body.dailyAvailableHours = Number(dailyHours);
    }

    try {
      const res = await fetch("/api/trip-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.error?.message ?? "Failed to plan your trip. Please try again.";
        setError(msg);
        return;
      }

      setTripPlan(data as TripPlanResponse);
      router.push("/recommendations");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#f8f5ed]" style={{ minHeight: "100vh" }}>
      <Nav />

      <main className="mx-auto max-w-[860px] px-4 pt-[110px] pb-16 sm:px-6 sm:pt-[130px] sm:pb-20">
        <div className="mb-10 text-center">
          <h1
            className="text-3xl font-bold tracking-tight text-[#173f2b] sm:text-4xl md:text-5xl"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Plan Your Manipur Trip
          </h1>
          <p className="mt-3 text-base text-[#4a5a50] sm:text-lg">
            Tell us your preferences and we&apos;ll generate personalized recommendations.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[rgba(23,63,43,.07)] bg-white p-6 shadow-[0_2px_20px_rgba(23,63,43,.06)] sm:p-8 md:p-10"
        >
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="duration"
                  className="mb-1.5 block text-sm font-semibold text-[#173f2b]"
                >
                  Trip Duration (days) *
                </label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="e.g. 3"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full rounded-xl border border-[#dce5dd] bg-[#faf9f6] px-4 py-2.5 text-sm text-[#173f2b] outline-none transition placeholder:text-[#66756c]/60 focus:border-[#3e8a5e] focus:ring-2 focus:ring-[#3e8a5e]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="budget"
                  className="mb-1.5 block text-sm font-semibold text-[#173f2b]"
                >
                  Budget (INR)
                </label>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  placeholder="Optional"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-[#dce5dd] bg-[#faf9f6] px-4 py-2.5 text-sm text-[#173f2b] outline-none transition placeholder:text-[#66756c]/60 focus:border-[#3e8a5e] focus:ring-2 focus:ring-[#3e8a5e]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-sm font-semibold text-[#173f2b]">
                Interests
              </label>
              <div className="flex flex-wrap gap-2.5">
                {INTERESTS.map((interest) => {
                  const selected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selected
                          ? "bg-[#28704e] text-white shadow-sm"
                          : "border border-[#28704e]/30 bg-[#faf9f6] text-[#28704e] hover:border-[#28704e] hover:bg-[#edf5ef] hover:text-[#173f2b]"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="location"
                  className="mb-1.5 block text-sm font-semibold text-[#173f2b]"
                >
                  Starting Location (optional)
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Imphal"
                  value={startingLocation}
                  onChange={(e) => {
                    setStartingLocation(e.target.value);
                    if (geoStatus === "detected") {
                      setGeoStatus("idle");
                      setGeoLat(null);
                      setGeoLng(null);
                    }
                  }}
                  className="w-full rounded-xl border border-[#dce5dd] bg-[#faf9f6] px-4 py-2.5 text-sm text-[#173f2b] outline-none transition placeholder:text-[#66756c]/60 focus:border-[#3e8a5e] focus:ring-2 focus:ring-[#3e8a5e]/20"
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3e8a5e] transition hover:text-[#173f2b]"
                >
                  &#9678; Use my current location
                </button>
                {geoStatus === "detected" && (
                  <p className="mt-1.5 text-xs font-medium text-[#3e8a5e]">Current location detected.</p>
                )}
                {geoStatus === "denied" && (
                  <p className="mt-1.5 text-xs font-medium text-[#b45309]">Location permission denied. You can enter a location manually.</p>
                )}
                {geoStatus === "unsupported" && (
                  <p className="mt-1.5 text-xs font-medium text-[#b45309]">Geolocation is not supported by your browser.</p>
                )}
                <p className="mt-1.5 text-xs text-[#66756c]">Optional &mdash; helps us personalize nearby recommendations.</p>
              </div>

              <div>
                <label
                  htmlFor="hours"
                  className="mb-1.5 block text-sm font-semibold text-[#173f2b]"
                >
                  Daily Available Hours
                </label>
                <input
                  id="hours"
                  type="number"
                  min="1"
                  max="24"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  className="w-full rounded-xl border border-[#dce5dd] bg-[#faf9f6] px-4 py-2.5 text-sm text-[#173f2b] outline-none transition placeholder:text-[#66756c]/60 focus:border-[#3e8a5e] focus:ring-2 focus:ring-[#3e8a5e]/20"
                />
              </div>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                {validationErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-[#28704e] px-4 py-3 text-base font-semibold text-white shadow-md transition hover:bg-[#1e5238] focus:outline-none focus:ring-2 focus:ring-[#3e8a5e] focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Planning your trip..." : "Plan My Trip →"}
          </button>
        </form>
      </main>
    </div>
  );
}
