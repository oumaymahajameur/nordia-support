import { useEffect, useMemo, useState } from "react";
import { Filters } from "./components/Filters";
import { TicketDetail } from "./components/TicketDetail";
import { TicketList } from "./components/TicketList";
import { useTickets } from "./hooks/useTickets";
import { STATUS_LABEL } from "./lib/labels";
import { DEFAULT_FILTERS, applyFilters } from "./lib/tickets";
import type { Status } from "./types";

type Notice = { kind: "error" | "success"; text: string };

export default function App() {
  const { tickets, state, error, reload, changeStatus, pending } = useTickets();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const visible = useMemo(() => applyFilters(tickets, filters), [tickets, filters]);
  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  function closeDetail() {
    const id = selectedId;
    setSelectedId(null);
    // Give the focus back to the ticket that was open
    setTimeout(() => {
      document.querySelector<HTMLElement>(`[data-ticket-id="${id}"]`)?.focus();
    }, 0);
  }

  // Escape closes the detail panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedId !== null) closeDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // The notice disappears by itself
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(id);
  }, [notice]);

  async function handleChange(id: number, to: Status) {
    const result = await changeStatus(id, to);
    setNotice(
      result.ok
        ? { kind: "success", text: `Status updated to “${STATUS_LABEL[to]}”.` }
        : { kind: "error", text: result.message },
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Nordia Support</h1>
      </header>

      <main className={selected ? "has-detail" : undefined}>
        <section className="list-pane" aria-label="Tickets">
          <Filters value={filters} onChange={setFilters} shown={visible.length} total={tickets.length} />

          {state === "loading" && <p role="status" className="state">Loading tickets…</p>}

          {state === "error" && (
            <div role="alert" className="state error">
              <p>{error}</p>
              <button type="button" onClick={() => void reload()}>Try again</button>
            </div>
          )}

          {state === "ready" && visible.length === 0 && (
            <div className="state">
              <p>No ticket matches your filters.</p>
              <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button>
            </div>
          )}

          {state === "ready" && visible.length > 0 && (
            <TicketList tickets={visible} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </section>

        {selected && (
          <TicketDetail
            ticket={selected}
            saving={pending.has(selected.id)}
            onChangeStatus={(to) => void handleChange(selected.id, to)}
            onClose={closeDetail}
          />
        )}
      </main>

      {notice && (
        <div className={`toast ${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
          {notice.text}
        </div>
      )}
    </div>
  );
}