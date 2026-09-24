const TIMEOUT_MS = 5000;

// Geocoding is enrichment, not a gate: a report that can't be located must still be
// saved. Every failure path here returns null so the caller inserts NULL coordinates
// rather than losing the submission.
async function geocodeAddress(address) {
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  const baseUrl = process.env.LOCATIONIQ_BASE_URL || 'https://us1.locationiq.com/v1';

  if (!apiKey) {
    console.warn('Geocoding skipped: LOCATIONIQ_API_KEY is not set');
    return null;
  }

  const url = `${baseUrl}/search?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(address)}&format=json&limit=1`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      // 404 is LocationIQ's "no match", which is an expected outcome, not a fault.
      console.warn(`Geocoding failed for "${address}": HTTP ${response.status}`);
      return null;
    }

    const results = await response.json();
    const match = Array.isArray(results) ? results[0] : null;

    if (!match) {
      console.warn(`Geocoding returned no results for "${address}"`);
      return null;
    }

    const latitude = parseFloat(match.lat);
    const longitude = parseFloat(match.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      console.warn(`Geocoding returned unparseable coordinates for "${address}"`);
      return null;
    }

    return { latitude, longitude };
  } catch (err) {
    const reason = err.name === 'AbortError' ? `timed out after ${TIMEOUT_MS}ms` : err.message;
    console.warn(`Geocoding failed for "${address}": ${reason}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { geocodeAddress };
