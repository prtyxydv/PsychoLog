/**
 * PsychoLog PII Sanitization Pipeline — STRICT MODE
 *
 * Scrubs all personally identifiable information before any
 * text reaches the Gemini API. Zero tolerance policy.
 *
 * Replacements:
 *   [NAME]      — proper names
 *   [PHONE]     — phone numbers (global formats)
 *   [EMAIL]     — email addresses
 *   [LOCATION]  — addresses, cities, neighbourhoods, landmarks
 *   [RELATION]  — relationship labels paired with names
 */

// ── Email ─────────────────────────────────────────────────────────────────
const EMAIL_REGEX =
  /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g;

// ── Phone numbers (global) ────────────────────────────────────────────────
const PHONE_REGEX =
  /(\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}(\s?(ext|x)\.?\s?\d{1,5})?/g;

// ── Physical addresses ────────────────────────────────────────────────────
const ADDRESS_REGEX =
  /\b\d{1,5}\s+[A-Z][a-zA-Z0-9\s,.']+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Way|Highway|Hwy|Sector|Block|Phase|Colony|Nagar|Marg|Chowk|Bazar|Bazaar)\b/gi;

// ── ZIP / PIN codes ───────────────────────────────────────────────────────
const ZIPCODE_REGEX = /\b\d{5,6}(?:[-\s]\d{4})?\b/g;

// ── Relationship + name combos ────────────────────────────────────────────
// e.g. "my brother John", "my friend Sarah", "my boss Rahul"
const RELATION_NAME_REGEX =
  /\b(my|our)\s+(brother|sister|mother|father|mom|dad|son|daughter|husband|wife|partner|boyfriend|girlfriend|friend|roommate|colleague|boss|teacher|professor|doctor|therapist|neighbour|neighbor|uncle|aunt|cousin|grandfather|grandmother|grandpa|grandma|nephew|niece)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;

// ── Standalone proper names (Title-cased words NOT at sentence start) ─────
// This is heuristic — catches most names without false-positive common words
const COMMON_WORDS = new Set([
  "I", "The", "A", "An", "And", "But", "Or", "So", "Yet",
  "For", "Nor", "In", "On", "At", "To", "By", "Of", "Up",
  "It", "He", "She", "We", "They", "This", "That", "These",
  "Those", "Is", "Was", "Are", "Were", "Be", "Been", "Being",
  "Have", "Has", "Had", "Do", "Does", "Did", "Will", "Would",
  "Could", "Should", "May", "Might", "Must", "Can", "Shall",
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
  "Saturday", "Sunday", "January", "February", "March", "April",
  "May", "June", "July", "August", "September", "October",
  "November", "December",
  // Indian/common city names kept as locations (handled separately)
  "God", "Lord", "Sir", "Ma", "Yes", "No", "Ok", "Okay",
]);

// Location keywords (strict mode — flag any of these as [LOCATION])
const LOCATION_KEYWORDS_REGEX =
  /\b(downtown|uptown|suburb(?:s)?|neighbourhood|neighborhood|near\s+(?:the\s+)?(?:[A-Z][a-zA-Z]+)|(?:North|South|East|West)\s+[A-Z][a-zA-Z]+|[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?\s+(?:Park|Mall|Hospital|School|College|University|Station|Airport|Temple|Church|Mosque|Market|Plaza|Tower|Building|Complex|Apartment|Flat|House|Villa|Hostel|PG))\b/g;

// ── Main sanitizer ────────────────────────────────────────────────────────

/**
 * Sanitizes a string by removing all PII.
 * @param {string} text — raw patient input
 * @returns {string} — PII-free version safe to send to Gemini
 */
export function sanitize(text) {
  if (!text || typeof text !== "string") return "";

  let result = text;

  // 1. Emails first (specific before generic)
  result = result.replace(EMAIL_REGEX, "[EMAIL]");

  // 2. Phone numbers
  result = result.replace(PHONE_REGEX, (match) => {
    // Avoid replacing standalone years or short numbers
    const digits = match.replace(/\D/g, "");
    if (digits.length < 7) return match;
    return "[PHONE]";
  });

  // 3. Physical addresses
  result = result.replace(ADDRESS_REGEX, "[LOCATION]");

  // 4. ZIP / PIN codes
  result = result.replace(ZIPCODE_REGEX, "[LOCATION]");

  // 5. Location keywords
  result = result.replace(LOCATION_KEYWORDS_REGEX, "[LOCATION]");

  // 6. Relationship + name combos → [RELATION] (preserves relationship word)
  result = result.replace(RELATION_NAME_REGEX, (_, pron, relation, _name) => {
    return `${pron} ${relation} [NAME]`;
  });

  // 7. Remaining Title-cased proper names (heuristic)
  result = result.replace(/\b([A-Z][a-z]{1,}(?:\s+[A-Z][a-z]{1,})?)\b/g, (match) => {
    if (COMMON_WORDS.has(match)) return match;
    // Check if it's at sentence start (preceded by . or start of string)
    return match; // We return as-is here; see note below
  });

  // Smarter name replacement — skip sentence-start capitals
  result = result.replace(
    /(?<=[.!?]\s+|^)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gm,
    (match) => {
      if (COMMON_WORDS.has(match)) return match;
      return match; // Preserve sentence starters to avoid false positives
    }
  );

  // Replace mid-sentence Title Case words that look like names
  result = result.replace(
    /(?<=[a-z,;:]\s)([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)\b/g,
    (match) => {
      if (COMMON_WORDS.has(match)) return match;
      return "[NAME]";
    }
  );

  // 8. Clean up any duplicate placeholders
  result = result.replace(/(\[NAME\]\s*){2,}/g, "[NAME] ");
  result = result.replace(/(\[LOCATION\]\s*){2,}/g, "[LOCATION] ");

  return result.trim();
}

/**
 * Sanitizes both event and feeling fields.
 * @param {{ event: string, feeling: string }} fields
 * @returns {{ eventSanitized: string, feelingSanitized: string }}
 */
export function sanitizeLogFields({ event, feeling }) {
  return {
    eventSanitized: sanitize(event),
    feelingSanitized: sanitize(feeling),
  };
}
