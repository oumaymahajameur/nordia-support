import type { Filters as FilterState, SortKey } from "../lib/tickets";
import { PRIORITY_LABEL, STATUS_LABEL } from "../lib/labels";
import { PRIORITIES, STATUSES } from "../types";

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  shown: number;
  total: number;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: "date_desc", label: "Date: newest first" },
  { key: "date_asc", label: "Date: oldest first" },
  { key: "priority_desc", label: "Priority: highest first" },
  { key: "priority_asc", label: "Priority: lowest first" },
];

export function Filters({ value, onChange, shown, total }: Props) {
  const set = <K extends keyof FilterState>(key: K, v: FilterState[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
      <label>
        Search
        <input
          type="search"
          placeholder="Title, customer, requester…"
          value={value.search}
          onChange={(e) => set("search", e.target.value)}
        />
      </label>
      <label>
        Status
        <select value={value.status} onChange={(e) => set("status", e.target.value as FilterState["status"])}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </label>
      <label>
        Priority
        <select value={value.priority} onChange={(e) => set("priority", e.target.value as FilterState["priority"])}>
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
          ))}
        </select>
      </label>
      <label>
        Sort by
        <select value={value.sort} onChange={(e) => set("sort", e.target.value as SortKey)}>
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </label>
      <p className="count" aria-live="polite">{shown} of {total} tickets</p>
    </form>
  );
}