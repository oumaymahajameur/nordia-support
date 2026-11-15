import { useCallback, useEffect, useState } from "react";
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

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      setTickets(await api.listTickets());
      setState("ready");
    } catch (e) {
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
      if (!current) return { ok: false, message: "Ticket introuvable." };
      if (pending.has(id)) return { ok: false, message: "Une modification est déjà en cours." };
      if (!canTransition(current.status, to))
        return { ok: false, message: "Ce changement de statut n'est pas autorisé." };

      const previous = current.status;
      setPending((p) => new Set(p).add(id));
      // 1) mise à jour optimiste : l'écran change tout de suite
      setTickets((list) => list.map((t) => (t.id === id ? { ...t, status: to } : t)));

      try {
        // 2) confirmation : on remplace par la version renvoyée par le serveur
        const saved = await api.updateStatus(id, to);
        setTickets((list) => list.map((t) => (t.id === id ? saved : t)));
        return { ok: true };
      } catch (e) {
        // 3) échec : retour à l'ancien statut
        setTickets((list) => list.map((t) => (t.id === id ? { ...t, status: previous } : t)));
        return { ok: false, message: messageFor(e) };
      } finally {
        setPending((p) => {
          const next = new Set(p);
          next.delete(id);
          return next;
        });
      }
    },
    [tickets, pending],
  );

  return { tickets, state, error, reload: load, changeStatus, pending };
}