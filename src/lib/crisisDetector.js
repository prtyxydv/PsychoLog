/**
 * PsychoLog Crisis Detection System
 *
 * Detects language indicating self-harm, suicidal ideation, or immediate danger.
 * This runs CLIENT-SIDE in real-time as patient types, and SERVER-SIDE on submit.
 *
 * Returns: { triggered: boolean, severity: 'low' | 'high', matchedPhrases: string[] }
 */

// ── High-severity triggers (immediate alert) ──────────────────────────────
const HIGH_SEVERITY_PATTERNS = [
  // Suicidal ideation — explicit
  /\b(want to|going to|plan to|going to|thinking about|considering)\s+(kill|end|take)\s+(my|myself|my life|it all)\b/i,
  /\b(suicid(e|al)|self.harm|self.hurt|self harm|self hurt)\b/i,
  /\b(don'?t want to (be alive|live|exist|wake up))\b/i,
  /\b(better off (dead|without me|if i (was|were) gone))\b/i,
  /\b(end (my|this) life|end it (all|here|now))\b/i,
  /\b(no reason to (live|go on|stay|continue))\b/i,
  /\b(goodbye (forever|for good|everyone|world))\b/i,
  /\b(cut(ting)? (myself|my (wrists?|arms?|skin)))\b/i,
  /\b(overdos(e|ing)|took (too many|all (the|my)) (pills?|tablets?|meds?))\b/i,
  /\b(hung(ry for death|myself)|hang(ing)? (myself|me))\b/i,
  /\b(jump(ing)? (off|from) (a|the) (bridge|building|roof|cliff|ledge))\b/i,
  /\bkms\b/i, // common abbreviation
  /\b(i('?ve| have) (hurt|harmed|cut|burned) myself\b)/i,
];

// ── Low-severity triggers (soft warning — watch, not alarm) ───────────────
const LOW_SEVERITY_PATTERNS = [
  /\b(feel(ing)? (hopeless|worthless|empty|numb|trapped|stuck|like a burden))\b/i,
  /\b(no(body|one) (cares?|would (miss|notice|care)))\b/i,
  /\b(can'?t (do this|go on|keep going|take it) (anymore|any more))\b/i,
  /\b(everything('?s| is) (pointless|meaningless|too much|falling apart))\b/i,
  /\b(wish(ing)? (i (was|were) (dead|gone|never born)|i could disappear))\b/i,
  /\b(tired of (living|life|being alive|fighting|everything))\b/i,
  /\b(what'?s the point)\b/i,
  /\b(i hate (my life|myself|everything|being alive))\b/i,
];

/**
 * @param {string} text — raw patient input (event or feeling field)
 * @returns {{ triggered: boolean, severity: 'low' | 'high', matchedPhrases: string[] }}
 */
export function detectCrisis(text) {
  if (!text || text.trim().length < 3) {
    return { triggered: false, severity: null, matchedPhrases: [] };
  }

  const matched = [];

  // Check high severity first
  for (const pattern of HIGH_SEVERITY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matched.push(match[0]);
    }
  }

  if (matched.length > 0) {
    return { triggered: true, severity: "high", matchedPhrases: matched };
  }

  // Check low severity
  const lowMatched = [];
  for (const pattern of LOW_SEVERITY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      lowMatched.push(match[0]);
    }
  }

  if (lowMatched.length > 0) {
    return { triggered: true, severity: "low", matchedPhrases: lowMatched };
  }

  return { triggered: false, severity: null, matchedPhrases: [] };
}

/**
 * Combines detection across multiple text fields.
 * @param {string[]} texts
 * @returns {{ triggered: boolean, severity: 'low' | 'high', matchedPhrases: string[] }}
 */
export function detectCrisisMultiple(texts) {
  let maxSeverity = null;
  const allMatched = [];

  for (const text of texts) {
    const result = detectCrisis(text);
    if (result.triggered) {
      allMatched.push(...result.matchedPhrases);
      if (result.severity === "high") {
        maxSeverity = "high";
      } else if (maxSeverity !== "high") {
        maxSeverity = "low";
      }
    }
  }

  return {
    triggered: allMatched.length > 0,
    severity: maxSeverity,
    matchedPhrases: [...new Set(allMatched)],
  };
}

/**
 * Helpline resources by country.
 * Shown to patient when crisis is detected.
 */
export const HELPLINES = [
  {
    country: "India",
    name: "iCall",
    number: "9152987821",
    hours: "Mon–Sat 8am–10pm",
  },
  {
    country: "India",
    name: "Vandrevala Foundation",
    number: "1860-2662-345",
    hours: "24/7",
  },
  {
    country: "India",
    name: "AASRA",
    number: "9820466627",
    hours: "24/7",
  },
  {
    country: "International",
    name: "Crisis Text Line",
    number: "Text HOME to 741741",
    hours: "24/7",
  },
  {
    country: "US",
    name: "988 Suicide & Crisis Lifeline",
    number: "988",
    hours: "24/7",
  },
  {
    country: "UK",
    name: "Samaritans",
    number: "116 123",
    hours: "24/7",
  },
];
