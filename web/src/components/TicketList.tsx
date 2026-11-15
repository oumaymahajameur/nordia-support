import { PRIORITY_LABEL, STATUS_LABEL, formatDate } from "../lib/labels";
import type { Ticket } from "../types";

interface Props {
  tickets: Ticket[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function TicketList({ tickets, selectedId, onSelect }: Props) {
  return (
    <ul className="ticket-list">
      {tickets.map((t) => (
        <li key={t.id}>
          <button
            type="button"
            className="ticket"
            aria-current={t.id === selectedId ? "true" : undefined}
            onClick={() => onSelect(t.id)}
          >
            <span className="ticket-title">{t.title}</span>
            <span className="ticket-customer">{t.customer}</span>
            <span className="ticket-meta">
              <span className={`badge p-${t.priority}`}>{PRIORITY_LABEL[t.priority]}</span>
              <span className={`badge s-${t.status}`}>{STATUS_LABEL[t.status]}</span>
              <time dateTime={t.createdAt}>{formatDate(t.createdAt)}</time>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}