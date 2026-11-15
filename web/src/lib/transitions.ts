import type { Status } from "../types";

// Règle connue : un ticket résolu ne peut pas être rouvert (l'API renvoie 409).
export function canTransition(from: Status, to: Status): boolean {
  if (from === to) return false;
  if (from === "resolved" && to === "open") return false;
  return true;
}