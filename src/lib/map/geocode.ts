// Reverse geocoding via OpenStreetMap Nominatim (free, no API key required).
// Usage policy: max ~1 req/sec, must set a descriptive User-Agent via the
// Referer header (browsers set this automatically) — fine for this app's
// low-traffic, non-bulk usage. https://operations.osmfoundation.org/policies/nominatim/
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=17&addressdetails=0`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}
