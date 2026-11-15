import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "../api/client";
import { canTransition } from "../lib/transitions";
import type { Status, Ticket } from "../types";

type LoadState = "loading" | "error" | "ready";
export type ChangeResult = { ok: true } | { ok: false; message: string };

function messageFor(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 409) return "This ticket is resolved and cannot be reopened.";
    if (e.status === 0) return "Server unreachable. The status was not changed.";
    if (e.status >= 500) return "Server error. The status was not changed, please try again.";
    return e.message;
  }
  return "Unexpected error.";
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<number>>(new Set());

  // Synchronous guard: state is only updated on the next render,
  // so two very fast calls could both pass a check on `pending`.
  const inFlight = useRef<Set<number>>(new Set());
  // Only the most recent load may write its result (ignores stale responses).
  const loadId = useRef(0);

  const load = useCallback(async () => {
    const id = ++loadId.current;
    setState("loading");
    setError(null);
    try {
      const list = await api.listTickets();
      if (id !== loadId.current) return;
      setTickets(list);
      setState("ready");
    } catch (e) {
      if (id !== loadId.current) return;
      setError(messageFor(e));
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = useCallback(
    async (id: number, to: Status): Promise<ChangeResult> => {
      const current = tickets.find((t) => t.id === id);
      if (!current) return { ok: false, message: "Ticket not found." };
      if (inFlight.current.has(id))
        return { ok: false, message: "A change is already in progress for this ticket." };
      if (!canTransition(current.status, to))
        return { ok: false, message: "This status change is not allowed." };

      const previous = current.status;
      inFlight.current.add(id);
      setPending((p) => new Set(p).add(id));
      // 1) optimistic update: the screen changes right away
      setTickets((list) => list.map((t) => (t.id === id ? { ...t, status: to } : t)));

      try {
        // 2) confirmation: replace with the version returned by the server
        const saved = await api.updateStatus(id, to);
        setTickets((list) => list.map((t) => (t.id === id ? saved : t)));
        return { ok: true };
      } catch (e) {
        // 3) failure: back to the previous status
        setTickets((list) => list.map((t) => (t.id === id ? { ...t, status: previous } : t)));
        return { ok: false, message: messageFor(e) };
      } finally {
        inFlight.current.delete(id);
        setPending((p) => {
          const next = new Set(p);
          next.delete(id);
          return next;
        });
      }
    },
    [tickets],
  );

  return { tickets, state, error, reload: load, changeStatus, pending };
}