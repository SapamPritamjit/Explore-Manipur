"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/store/trip";
import type { TripPlanResponse } from "@/store/trip";

const INTEREST_OPTIONS = [
  "Nature",
  "Culture",
  "History",
  "Food",
  "Adventure",
  "Wildlife",
  "Festivals",
  "Shopping",
] as const;

type Status = "idle" | "loading" | "error" | "success";

export default function AiPlannerPage() {
  const router = useRouter();
  const setTripPlan = useTripStore((s) => s.setTripPlan);

  const [durationDays, setDurationDays] = useState(3);
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [startingLocation, setStartingLocation] = useState("");
  const [dailyAvailableHours, setDailyAvailableHours] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  function handleUseMyLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setStartingLocation("Current location");
        setGeoError(null);
      },
      () => {
        setGeoError("Location permission denied. You can continue without it.");
        setLatitude(null);
        setLongitude(null);
      }
    );
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!Number.isFinite(durationDays) || durationDays < 1) {
      errors.push("Trip duration must be at least 1 day.");
    }
    if (budget !== "" && (isNaN(Number(budget)) || Number(budget) < 0)) {
      errors.push("Budget must be a non-negative number.");
    }
    if (
      dailyAvailableHours !== "" &&
      (isNaN(Number(dailyAvailableHours)) || Number(dailyAvailableHours) <= 0)
    ) {
      errors.push("Daily available hours must be a positive number.");
    }
    if ((latitude == null) !== (longitude == null)) {
      errors.push("Both latitude and longitude are required when using location.");
    }
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setValidationErrors([]);

    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setStatus("loading");

    const body: Record<string, unknown> = {
      tripDurationDays: durationDays,
      interests,
    };

    if (budget !== "") {
      body.budget = Number(budget);
    }
    if (startingLocation.trim() !== "") {
      body.startingLocation = startingLocation.trim();
    }
    if (latitude != null && longitude != null) {
      body.startingLatitude = latitude;
      body.startingLongitude = longitude;
    }
    if (dailyAvailableHours !== "") {
      body.dailyAvailableHours = Number(dailyAvailableHours);
    }

    try {
      const response = await fetch("/api/trip-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.error?.code === "validation-error" && Array.isArray(data.error.details)) {
          setValidationErrors(
            data.error.details.map(
              (d: { field: string; message: string }) => `${d.field}: ${d.message}`
            )
          );
        } else {
          setErrorMessage(
            data?.error?.message ?? "Failed to generate trip plan. Please try again."
          );
        }
        setStatus("error");
        return;
      }

      setTripPlan(data as TripPlanResponse);
      setStatus("success");
      router.push("/recommendations");
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8" style={{ background: "#faf8f5" }}>
      <div className="w-full max-w-[850px]">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "#1a3c2a", fontFamily: "Georgia, 'Times New Roman', serif" }}>AI Trip Planner</h1>
          <p className="mt-3 text-base sm:text-lg" style={{ color: "#4a6358" }}>
            Build a personalized Manipur trip using our smart planning engine.
          </p>
        </div>

        {validationErrors.length > 0 && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {geoError && (
          <div className="mb-6 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-700">{geoError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border p-6 sm:p-8" style={{ background: "#ffffff", boxShadow: "0 4px 24px rgba(26, 60, 42, 0.08)", borderColor: "#e8e4df" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1.5" style={{ color: "#1a3c2a" }}>
                Trip Duration (days) *
              </label>
              <input
                id="duration"
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-shadow"
                style={{ borderColor: "#d4cfc8" }}
                required
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium mb-1.5" style={{ color: "#1a3c2a" }}>
                Budget (optional)
              </label>
              <input
                id="budget"
                type="number"
                min={0}
                step="any"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-shadow"
                style={{ borderColor: "#d4cfc8" }}
              />
            </div>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium mb-3" style={{ color: "#1a3c2a" }}>
              Interests *
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
                    style={selected ? { borderColor: "#2d6a4f", background: "#e8f5e9", color: "#1a3c2a" } : { borderColor: "#d4cfc8", background: "#ffffff", color: "#4a6358" }}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            {interests.length === 0 && (
              <p className="mt-2 text-xs" style={{ color: "#7a8f84" }}>Select at least one interest for better recommendations.</p>
            )}
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1.5" style={{ color: "#1a3c2a" }}>
                Starting Location (optional)
              </label>
              <div className="flex gap-2">
                <input
                  id="location"
                  type="text"
                  value={startingLocation}
                  onChange={(e) => {
                    setStartingLocation(e.target.value);
                    setLatitude(null);
                    setLongitude(null);
                  }}
                  placeholder="e.g. Imphal"
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-shadow"
                  style={{ borderColor: "#d4cfc8" }}
                />
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{ borderColor: "#d4cfc8", color: "#1a3c2a", background: "#faf8f5" }}
                >
                  Use my current location
                </button>
              </div>
              {latitude != null && longitude != null && (
                <p className="mt-1.5 text-xs" style={{ color: "#2d6a4f" }}>
                  Location set ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                </p>
              )}
            </div>

            <div>
              <label htmlFor="hours" className="block text-sm font-medium mb-1.5" style={{ color: "#1a3c2a" }}>
                Daily Available Hours (optional)
              </label>
              <input
                id="hours"
                type="number"
                min={1}
                max={24}
                step="any"
                value={dailyAvailableHours}
                onChange={(e) => setDailyAvailableHours(e.target.value)}
                placeholder="e.g. 8"
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-shadow"
                style={{ borderColor: "#d4cfc8" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: status === "loading" ? "#4a6358" : "#1a3c2a" }}
            onMouseEnter={(e) => { if (status !== "loading") (e.currentTarget.style.background = "#2d6a4f"); }}
            onMouseLeave={(e) => { if (status !== "loading") (e.currentTarget.style.background = "#1a3c2a"); }}
          >
            {status === "loading" ? "Generating your trip plan..." : "Generate Trip Plan"}
          </button>
        </form>
      </div>
    </main>
  );
}
