/**
 * Minimal Attio REST API client for the sequences app.
 * Used by the reply detector to check whether a meeting has been booked
 * on a deal record after a sequence started.
 *
 * NOTE: Attio's meetings API shape should be verified against the live
 * workspace — field slugs (e.g. "associated_deals", meeting object slug)
 * may need to be adjusted to match the actual Attio configuration.
 */

const ATTIO_BASE = 'https://api.attio.com/v2';

function authHeaders() {
  const token = process.env.ATTIO_API_TOKEN;
  if (!token) throw new Error('ATTIO_API_TOKEN not configured');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function attioFetch(path, options = {}) {
  const res = await fetch(`${ATTIO_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Attio ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Fetch a deal record by ID. Used to grab the deal name for the dashboard.
 */
async function getDeal(dealId) {
  try {
    const data = await attioFetch(`/objects/deals/records/${dealId}`);
    const name =
      data?.data?.values?.name?.[0]?.value ||
      data?.data?.values?.name?.[0]?.full_name ||
      dealId;
    return { id: dealId, name };
  } catch (err) {
    return { id: dealId, name: dealId };
  }
}

/**
 * Check whether a meeting has been booked on the given deal record
 * after the provided ISO timestamp. Returns true if a qualifying meeting exists.
 */
async function hasMeetingBookedSince(dealId, sinceIso) {
  try {
    const body = {
      filter: {
        associated_deals: { target_record_id: dealId },
        created_at: { $gte: sinceIso },
      },
      limit: 1,
    };
    const data = await attioFetch(`/objects/meetings/records/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return Array.isArray(data?.data) && data.data.length > 0;
  } catch (err) {
    console.error(`Attio meeting check failed for deal ${dealId}:`, err.message);
    return false;
  }
}

module.exports = { getDeal, hasMeetingBookedSince };
