export const STATUSES = ["open", "in_progress", "waiting_customer", "resolved"] as const;
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

export interface Ticket {
  id: number;
  title: string;
  customer: string;
  requester: string;
  priority: Priority;
  status: Status;
  description: string;
  createdAt: string;
  updatedAt: string;
}