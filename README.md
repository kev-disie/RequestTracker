# Request Tracker

A simple web app for submitting and managing requests, feedback, bug reports, and ideas — built with plain HTML, CSS, and JavaScript (no frameworks, no build tools).

**Live demo:** tiny-donut-c52483.netlify.app

---

## What it does

- Submit a request with name, email, product/company, request type, priority, and a message
- All submitted requests appear instantly in a list
- Each request has a status (`New`, `In Review`, `Resolved`, `Rejected`) that can be changed from a dropdown on its card
- Requests can be deleted
- Requests can be filtered by product, type, priority, and status, and searched by name/email/message
- Data is saved in the browser's `localStorage`, so requests persist across page refreshes

---

## Technology used

- **HTML** — page structure
- **CSS** — all styling, no framework, plain selectors (no preprocessors or CSS variables, kept intentionally simple)
- **JavaScript (vanilla)** — form handling, rendering, filtering, and data persistence
- **localStorage** — used as the data store; no backend or database

No frameworks, no npm packages, no build step. Open `index.html` and it runs.

---

## How to run it locally

1. Clone or download this repository
2. Make sure `index.html`, `style.css`, and `app.js` are in the same folder
3. Open `index.html` directly in any modern browser

No server or installation required.

---

## What I completed

- Full request submission form with validation (required fields, basic email format check)
- Live rendering of submitted requests as cards
- Status management per request (New / In Review / Resolved / Rejected)
- Delete functionality
- Multiple working filters (product, type, priority, status) plus free-text search
- Data persistence via `localStorage` — requests survive a page refresh
- Responsive layout that collapses to a single column on small screens

---

## What I did not complete / known limitations

**No access control on status changes.** Right now, anyone viewing the app — including the person who submitted a request — can open the status dropdown on any card and change it freely, including reversing a `Resolved` or `Rejected` request back to `New`. There's no concept of "submitter" vs. "reviewer/admin" in this version, and no authentication at all.

In a real product, I'd want:
- A login system distinguishing regular users from admins/reviewers
- Only admins able to change status
- Possibly locking a request's editable fields once it's no longer `New`
- An audit trail showing who changed a status and when

I left this out deliberately to focus my limited time on getting the core flow (submit → list → filter → status → persist) working cleanly and reliably, rather than half-building an authentication system. I'd treat this as the top priority for a "v2."

**No backend/database.** This version uses `localStorage`, which means data is local to one browser on one device — it won't sync across devices or be visible to anyone but the person using that browser. A real version would need a backend (e.g. a small API + database, or something like Firebase/Supabase) so requests are shared and persistent across users.

**No edit functionality.** Once submitted, a request's name/email/message/etc. can't be edited — only the status can change (and currently, by anyone).

---

## Challenges faced

The main challenge was deciding how much "real" functionality to fake versus genuinely build, given the time constraints. I chose `localStorage` over building a backend so I could focus on getting the UI and core logic fully working and polished rather than spreading time thin across a frontend and backend. Event delegation for dynamically-created cards (status dropdowns and delete buttons that don't exist until requests are rendered) was the trickiest JavaScript concept to get right — I solved it by attaching a single listener to the parent list container instead of trying to attach listeners to each card individually.

---

## What I'd improve with more time

1. Add a basic admin/reviewer role so only authorized users can change status
2. Move from `localStorage` to a real backend with a database, so data is shared across users/devices
3. Add the ability to edit a submitted request
4. Add sorting (by date, priority, etc.) alongside the existing filters
5. Add form-level error messages instead of a plain `alert()` for invalid submissions
6. Add automated tests for the filtering and rendering logic
                             
