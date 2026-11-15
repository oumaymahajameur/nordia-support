# Design note: Nordia Support dashboard

## 1. How I understood the need, and my assumptions

The support team needs a small, reliable dashboard to find tickets quickly and
update their status. The mock API is deliberately unreliable (random latency,
about 1 call in 8 fails, resolved tickets cannot be reopened), so I read the
real goal as: stay usable and honest with the user when the API misbehaves.

Assumptions (I asked three questions on my personal page and worked with these
while waiting for the answer):

- Status changes are optimistic, with rollback on failure.
- The only transition rule is the one the API enforces (resolved to open).
- Default view: newest first, no filter. "Date" means creation date.

## 2. Architecture, and two choices I hesitated over

React + TypeScript + Vite. Pure logic (search, filter, sort, transition rules,
URL state) is separated from components, so it is easy to test. One hook,
`useTickets`, owns loading, errors and status changes. The API client throws
typed errors, so the interface can tell a 409 from a 500.

- **Optimistic update or wait for confirmation.** Optimistic feels immediate,
  which the brief asks for, but it needs a rollback path and protection against
  double changes (a synchronous guard in the hook, and the select disabled
  while a change is in flight). I chose optimistic and kept the logic in one
  function so it can be switched.
- **Client-side or server-side filtering.** The API has no filter parameters
  and there are only 60 tickets, so filtering, sorting and pagination on the
  client are simpler and instant. It would not scale to large volumes.

## 3. What I tested, and what I could not

20 automated tests: sorting by priority and date (including ties), combined
search and filters, URL state (restore, invalid values ignored, page), retry
of a GET after a 500, optimistic update, rollback on 409 and 500, a second
change ignored while one is in flight, a stale load ignored, and component
tests for the error state with retry, the detail panel focus and Escape, and
the status rollback with an error message. I also tested by hand: keyboard
navigation, a narrow mobile window, shared links (including invalid ones such
as `?status=banana`, `?page=99` and a ticket that does not exist), the dark
mode toggle after a reload, and repeated status changes until the API failed.

Not tested: screen readers, an automated accessibility audit, real devices,
other browsers, end-to-end flows, and the timing of the random failures
(mocked in tests, not measured).

## 4. What I cut, and why

End-to-end tests: they need extra tooling and did not fit the time limit.
The URL uses `replaceState`, so the browser Back button does not step through
filter changes: a simpler choice that keeps links shareable. Visual design is
deliberately minimal. I also did not add a state library or a data-fetching
library: the app is small enough for plain hooks.

## 5. Where and how I used AI

I used an AI assistant (Claude) throughout: to plan the structure, draft the
code and tests, review my hook, and explain errors. Its review found two real
problems in my first version of `useTickets` (a double-change guard based on
React state, and no protection against stale loads), which I then fixed and
covered with tests. Details are in `AI-USAGE.md`. I ran every piece of code,
read it, and checked behaviour by hand, especially the rollback, the keyboard
focus and the shared links.

## 6. With one more day

- Screen reader testing and an automated accessibility check (Lighthouse or axe).
- End-to-end tests (Playwright) for the main flow.
- Keep keyboard focus on the status select while saving (`aria-disabled`).
- Handle a reload that arrives while a status change is saving.
- Browser Back button support for filter changes (`pushState`).
- A "retry" button on a failed status change.