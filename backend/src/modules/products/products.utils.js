export const RATE_FIELDS = Object.freeze({
  mrp: 'mrpPaise',
  wholesaleRate: 'wholesalePaise',
  retailRate: 'retailPaise',
  costRate: 'costPaise'
});

export function toPaise(rupees) {
  return Math.round(rupees * 100);
}

export function fromPaise(paise) {
  return paise === null || paise === undefined ? null : paise / 100;
}

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildSearchText({ brand, series, category, name, code }) {
  return [brand, series, category, name, code].filter(Boolean).join(' ').toLowerCase();
}

export function searchClauses(search) {
  const tokens = (search ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);

  return tokens.map((token) => ({ searchText: { $regex: escapeRegex(token) } }));
}

export function diffRates(variant, patch) {
  const set = {};
  const changes = [];

  for (const [field, column] of Object.entries(RATE_FIELDS)) {
    if (patch[field] === undefined) continue;

    const next = patch[field] === null ? null : toPaise(patch[field]);
    const previous = variant[column] ?? null;

    if (next !== previous) {
      set[column] = next;
      changes.push({ field, oldPaise: previous, newPaise: next });
    }
  }

  return { set, changes };
}

export function positionalSet(set) {
  return Object.fromEntries(
    Object.entries(set).map(([column, value]) => [`variants.$.${column}`, value])
  );
}

export function fail(status, message, errors = {}) {
  return { error: { status, message, errors } };
}
