type Allowed<T> = { [K in keyof T]?: readonly string[] };

/** Reads filters from the address bar. Unknown or invalid values fall back to the defaults. */
export function readFilters<T extends object>(defaults: T, allowed: Allowed<T> = {}): T {
  const params = new URLSearchParams(window.location.search);
  const lists = allowed as Record<string, readonly string[] | undefined>;
  const base = defaults as Record<string, unknown>;
  const out: Record<string, unknown> = { ...base };
  for (const [key, def] of Object.entries(base)) {
    const raw = params.get(key);
    if (raw === null || typeof def !== "string") continue;
    const list = lists[key];
    if (list && !list.includes(raw)) continue; // e.g. ?status=banana is ignored
    out[key] = raw;
  }
  return out as T;
}

export function readSelectedId(): number | null {
  const raw = new URLSearchParams(window.location.search).get("ticket");
  const id = raw === null ? NaN : Number(raw);
  return Number.isInteger(id) ? id : null;
}

/** Page number from the address bar; anything invalid means page 1. */
export function readPage(): number {
  const raw = new URLSearchParams(window.location.search).get("page");
  const page = raw === null ? NaN : Number(raw);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** Writes only non-default values, so the default view keeps a clean address. */
export function writeUrl<T extends object>(
  filters: T,
  defaults: T,
  selectedId: number | null,
  page = 1,
) {
  const f = filters as Record<string, unknown>;
  const d = defaults as Record<string, unknown>;
  const params = new URLSearchParams();
  for (const key of Object.keys(d)) {
    if (f[key] !== d[key]) params.set(key, String(f[key]));
  }
  if (page > 1) params.set("page", String(page));
  if (selectedId !== null) params.set("ticket", String(selectedId));
  const query = params.toString();
  window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
}