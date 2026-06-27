/**
 * PsychoLog Shared Utilities
 */

/**
 * Generates a human-readable patient alias.
 * Format: Patient-[Adjective]-[Number]
 * e.g. "Patient-Alpha-7", "Patient-Delta-12"
 */
const ALIAS_ADJECTIVES = [
  "Alpha", "Beta", "Delta", "Echo", "Foxtrot", "Golf",
  "Hotel", "India", "Juliet", "Kilo", "Lima", "Mike",
  "November", "Oscar", "Papa", "Quebec", "Romeo", "Sierra",
  "Tango", "Uniform", "Victor", "Whiskey", "Yankee", "Zulu",
];

export function generatePatientAlias() {
  const adj = ALIAS_ADJECTIVES[Math.floor(Math.random() * ALIAS_ADJECTIVES.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10–99
  return `Patient-${adj}-${num}`;
}

/**
 * Generates a cryptographically random invite token (URL-safe base64).
 */
export function generateInviteToken() {
  const array = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  }
  return Buffer.from(array).toString("base64url");
}

/**
 * Formats a date for display in the therapist dashboard.
 * @param {string|Date} date
 * @returns {string} e.g. "Jun 27, 2026"
 */
export function formatDisplayDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date as relative time.
 * @param {string|Date} date
 * @returns {string} e.g. "2 days ago"
 */
export function formatRelativeTime(date) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDisplayDate(date);
}

/**
 * Maps mood score (1–10) to a color and label.
 */
export function getMoodMeta(score) {
  if (score <= 2) return { color: "#DC2626", label: "Very Low",   bg: "#FEF2F2" };
  if (score <= 4) return { color: "#F97316", label: "Low",        bg: "#FFF7ED" };
  if (score <= 6) return { color: "#EAB308", label: "Moderate",   bg: "#FEFCE8" };
  if (score <= 8) return { color: "#22C55E", label: "Good",       bg: "#F0FDF4" };
  return             { color: "#0D9488", label: "Very Good",  bg: "#F0FDFA" };
}

/**
 * Checks if a date is within the past N hours.
 */
export function isWithinHours(date, hours) {
  const now = Date.now();
  const then = new Date(date).getTime();
  return now - then < hours * 60 * 60 * 1000;
}

/**
 * Truncates text to maxLength with ellipsis.
 */
export function truncate(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
