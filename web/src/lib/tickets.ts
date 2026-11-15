import type { Priority, Status, Ticket } from "../types";

export type SortKey = "date_desc" | "date_asc" | "priority_desc" | "priority_asc";

export interface Filters {
  search: string;
  status: Status | "all";
  priority: Priority | "all";
  sort: SortKey;
}

export const DEFAULT_FILTERS: Filters = {
  search: "",
  status: "all",
  priority: "all",
  sort: "date_desc", // hypothèse : les plus récents d'abord
};

const RANK: Record<Priority, number> = { low: 0, medium: 1, high: 2, urgent: 3 };

const byDate = (a: Ticket, b: Ticket) =>
  Date.parse(a.createdAt) - Date.parse(b.createdAt);

export function applyFilters(tickets: Ticket[], f: Filters): Ticket[] {
  const q = f.search.trim().toLowerCase();

  const filtered = tickets.filter((t) => {
    if (f.status !== "all" && t.status !== f.status) return false;
    if (f.priority !== "all" && t.priority !== f.priority) return false;
    if (!q) return true;
    return [t.title, t.customer, t.requester, t.description].some((s) =>
      s.toLowerCase().includes(q),
    );
  });

  // [...filtered] : on ne modifie jamais le tableau d'origine
  return [...filtered].sort((a, b) => {
    switch (f.sort) {
      case "date_asc":
        return byDate(a, b);
      case "date_desc":
        return byDate(b, a);
      case "priority_asc":
        return RANK[a.priority] - RANK[b.priority] || byDate(b, a);
      case "priority_desc":
        return RANK[b.priority] - RANK[a.priority] || byDate(b, a);
    }
  });
}