const RAW_BASE_URL = import.meta.env.VITE_INTAKE_API_BASE_URL || "";

/**
 * Normalize base URL so:
 * - "" stays ""
 * - "https://x.com/" becomes "https://x.com"
 */
function normalizeBaseUrl(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

const BASE_URL = normalizeBaseUrl(RAW_BASE_URL);

export function toErrorMessage(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err?.userMessage) return String(err.userMessage);
  if (err instanceof Error) return err.message || "Error";
  try {
    return JSON.stringify(err);
  } catch {
    return "Error";
  }
}

/**
 * Best-effort check: if fetch failed due to network/DNS/CORS/timeout, treat as service down.
 * If server responded with HTTP status, that is NOT "service down".
 */
export function isLikelyServiceDown(err) {
  if (!err) return false;
  if (err?.name === "AbortError") return true;
  if (err?.isNetworkError) return true;
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("load failed") ||
    msg.includes("dns") ||
    msg.includes("timeout") ||
    msg.includes("timed out")
  );
}

async function readErrorPayload(res) {
  // Try JSON first
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      const j = await res.json();
      // Expect { error: { code, message } } optionally
      const code = j?.error?.code || j?.code;
      const message = j?.error?.message || j?.message;
      return { code, message, raw: j };
    } catch {
      // fall through
    }
  }
  // Fallback text
  try {
    const text = await res.text();
    return { code: null, message: text || null, raw: text || null };
  } catch {
    return { code: null, message: null, raw: null };
  }
}

export async function submitIntake({ payload, files, timeoutMs = 120000 }) {
  const url = `${BASE_URL}/api/intake/submit`;

  const form = new FormData();
  form.append(
    "payload.json",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
    "payload.json"
  );

  for (const f of files || []) {
    if (f) form.append("files", f, f.name);
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });

    if (!res.ok) {
      const { code, message } = await readErrorPayload(res);

      const e = new Error(
        message
          ? `Submit failed (${res.status}). ${message}`.trim()
          : `Submit failed (${res.status}).`
      );

      e.httpStatus = res.status;
      e.code = code || null;
      e.userMessage = message || null;
      throw e;
    }

    // Success JSON expected
    try {
      return await res.json();
    } catch {
      return { receiptId: "", submittedAtIso: new Date().toISOString() };
    }
  } catch (err) {
    // Distinguish network error
    if (err?.name === "AbortError") {
      const e = new Error("Request timed out while submitting. Please try again.");
      e.isNetworkError = true;
      throw e;
    }

    // Browser fetch failures are often TypeError with "Failed to fetch"
    if (err instanceof TypeError) {
      const e = new Error("Unable to reach the intake service. Please try again.");
      e.isNetworkError = true;
      throw e;
    }

    throw err;
  } finally {
    clearTimeout(t);
  }
}