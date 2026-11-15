import { useEffect, useRef } from "react";
import { PRIORITY_LABEL, STATUS_LABEL, formatDate } from "../lib/labels";
import { canTransition } from "../lib/transitions";
import { STATUSES, type Status, type Ticket } from "../types";

interface Props {
  ticket: Ticket;
  saving: boolean;
  onChangeStatus: (to: Status) => void;
  onClose: () => void;
}

export function TicketDetail({ ticket, saving, onChangeStatus, onClose }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the panel when a ticket opens
  useEffect(() => {
    headingRef.current?.focus();
  }, [ticket.id]);

  return (
    <aside className="detail" aria-label="Ticket details">
      <button type="button" className="close" onClick={onClose}>← Back to list</button>
      <h2 ref={headingRef} tabIndex={-1}>{ticket.title}</h2>
      <dl>
        <dt>Customer</dt><dd>{ticket.customer}</dd>
        <dt>Requester</dt><dd>{ticket.requester}</dd>
        <dt>Priority</dt>
        <dd><span className={`badge p-${ticket.priority}`}>{PRIORITY_LABEL[ticket.priority]}</span></dd>
        <dt>Created</dt><dd>{formatDate(ticket.createdAt)}</dd>
        <dt>Last update</dt><dd>{formatDate(ticket.updatedAt)}</dd>
      </dl>
      <p className="description">{ticket.description}</p>

      <label className="status-field">
        Status
        <select
          value={ticket.status}
          disabled={saving}
          onChange={(e) => onChangeStatus(e.target.value as Status)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} disabled={s !== ticket.status && !canTransition(ticket.status, s)}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      {saving && <p role="status">Saving…</p>}
    </aside>
  );
}