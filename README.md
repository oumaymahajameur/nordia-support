# Nordia Support: ticket dashboard

A small dashboard for a support team: browse tickets, search, filter, sort,
open a ticket and change its status, with clean handling of API failures.

Built with React 19, TypeScript and Vite. Tests with Vitest and Testing Library.

## Run it

Requirements: Node.js 18 or later.

Terminal 1, the mock API (provided):

```bash
cd api
node server.js
```

It listens on http://localhost:3001.

Terminal 2, the web app:

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173.

To use another API address, set `VITE_API_URL` (default: `http://localhost:3001`).

## Test it

```bash
cd web
npm test
```

20 tests in 6 files:

- `lib/tickets.test.ts`: sorting (priority, date, ties), search and filters.
- `lib/urlState.test.ts`: filters, ticket and page restored from the URL, invalid values ignored, only non-default values written.
- `api/client.test.ts`: a GET is retried after a 500.
- `hooks/useTickets.test.ts`: optimistic update, rollback on 409 and 500, second change on the same ticket ignored while one is in flight, stale load ignored.
- `App.test.tsx`: empty state when nothing matches the search.
- `App.components.test.tsx`: error state with "Try again", detail panel focus and Escape, status rollback with an error message.

## Features

- Ticket list: title, customer, priority, status, date.
- Search (title, customer, requester, description) and filters by status and priority.
- Sorting by date and by priority (urgent > high > medium > low).
- Pagination, 10 tickets per page. A new search or filter goes back to page 1.
- Detail panel, closed with the "Back to list" button or the Escape key.
- Status change with immediate feedback and rollback if the API refuses.
- Loading, error (with retry) and empty states.
- Responsive: on small screens the detail panel replaces the list.
- Keyboard: native buttons and selects, visible focus, focus moves to the
  panel when a ticket opens and returns to the ticket when it closes.
- Shareable URL: search, filters, sort, page and the open ticket are kept in
  the address bar. Invalid values (for example `?status=banana`) are ignored,
  a page that does not exist falls back to the last page, and a link to a
  ticket that does not exist closes the panel.
- Dark mode: a toggle in the header. The choice is remembered in the browser;
  without a saved choice, the system preference is used.

## Structure

```
web/src
  api/client.ts         fetch wrapper, typed errors, retry on reads
  lib/tickets.ts        pure logic: search, filter, sort
  lib/urlState.ts       read and write filters, page and open ticket in the URL
  lib/transitions.ts    status transition rules (one place)
  lib/labels.ts         display labels and date format
  hooks/useTickets.ts   loading, errors, optimistic status change
  hooks/useTheme.ts     light/dark theme, saved in localStorage
  components/           Filters, TicketList, TicketDetail, Pagination
  App.tsx               wiring
```

## Choices and assumptions

- **Optimistic update with rollback.** The screen changes immediately; if the
  API fails, the previous status is restored and an error message is shown.
  The logic lives in one function, so switching to "wait for confirmation"
  is a small change.
- **Retry only on reads.** GET requests are retried (3 attempts, increasing
  delay) because the mock API fails randomly. Status changes are never
  retried automatically; the user decides.
- **One change at a time per ticket.** The status select is disabled while a
  change is in flight, and the hook also refuses a second call with a
  synchronous guard (a ref), because React state only updates on the next
  render and two very fast clicks could both pass a state check.
- **Stale responses.** Each load has a number; only the latest load may write
  its result, so a slow older response cannot overwrite a newer one.
- **Filtering, sorting and pagination on the client.** Fine for 60 tickets;
  it would move to the server with much larger volumes.
- **Default view:** newest first, no filter, page 1. "Date" means creation date.
- **Transition rule:** only resolved to open is forbidden, as in the API.
  That option is disabled in the interface, and a 409 is still handled
  if it happens.
- **URL uses `replaceState`, not `pushState`.** Links are shareable and survive
  a reload, but the browser Back button does not step through filter changes.
- **Dark mode with CSS variables.** All colours are variables defined for the
  light and dark themes, so adding another theme only means a new set of values.

## What is not done

- End-to-end tests, and tests for dark mode and pagination at component level
  (pagination and URL logic are covered by unit tests only).
- Manual accessibility checks only (keyboard); no screen reader testing and
  no automated accessibility audit.
- While a status change is saving, the select is disabled and loses keyboard
  focus. `aria-disabled` would keep it.
- If "Try again" is used while a status change is still saving, the reloaded
  list can overwrite the optimistic state. Very rare, not handled.
- The dark palette was checked visually, not with a contrast tool.