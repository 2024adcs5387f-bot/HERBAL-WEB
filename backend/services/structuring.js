// backend/services/structuring.js
// Utilities to normalize and validate structured research payloads

export function normalizeStructured(input = {}, post = {}) {
  const out = {};

  // Schema version
  out.schema_version = typeof input.schema_version === 'string'
    ? input.schema_version
    : (typeof input.schemaVersion === 'string' ? input.schemaVersion : '1.0');

  // Entities normalization
  const entities = input.entities || {};
  out.entities = {
    herbs: toArray(entities.herbs).map(toString),
    diseases: toArray(entities.diseases).map(toString),
    compounds: toArray(entities.compounds).map(toString),
    mechanisms: toArray(entities.mechanisms).map(toString),
    dosages: toArray(entities.dosages).map((d) => normalizeDosage(d)),
    outcomes: toArray(entities.outcomes).map((o) => normalizeOutcome(o)),
  };

  // Keyphrases as array of strings
  out.keyphrases = toArray(input.keyphrases).map(toString);

  // Annotations as JSON object
  out.annotations = isObject(input.annotations) ? input.annotations : {};

  // Embedding as JSON
  out.embedding = input.embedding ?? null;

  // Optionally enrich from post fields
  if (post?.related_herb_id && !out.entities.herbs?.length) {
    out.entities.herbs = [String(post.related_herb_id)];
  }
  if (post?.related_disease_id && !out.entities.diseases?.length) {
    out.entities.diseases = [String(post.related_disease_id)];
  }

  return out;
}

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null) return [];
  return [v];
}

function toString(v) {
  if (v === undefined || v === null) return '';
  return typeof v === 'string' ? v : JSON.stringify(v);
}

function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function normalizeDosage(d) {
  if (!isObject(d)) return { raw: toString(d) };
  const amount = d.amount ?? d.dose ?? d.value;
  const unit = d.unit ?? d.units;
  return { amount, unit, route: d.route, frequency: d.frequency, raw: d.raw };
}

function normalizeOutcome(o) {
  if (!isObject(o)) return { raw: toString(o) };
  return {
    type: o.type ?? o.kind,
    value: o.value ?? o.effect,
    metric: o.metric,
    raw: o.raw,
  };
}
