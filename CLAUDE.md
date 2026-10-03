# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

The git root holds a single app in `front-end-master/` — run all npm commands from there. It is "MasterPortal", a React 19 + Vite admin UI for CRUD on master data (plants, divisions, machines, projects, components, activities, sub-activities, shifts, designations, employees) against an ASP.NET backend.

## Commands

```bash
cd front-end-master
npm run dev       # Vite dev server
npm run build     # production build
npm run lint      # oxlint (config: .oxlintrc.json — react/rules-of-hooks, only-export-components)
npm run preview   # serve the build
```

There is no test framework configured. The code is plain JavaScript/JSX (no TypeScript).

Backend URL comes from `VITE_API_BASE_URL` in `front-end-master/.env` (see `.env.example`); services fall back to `https://localhost:44361`.

## Architecture

- **Routing / shell** — [src/App.jsx](front-end-master/src/App.jsx) holds everything: `NAV_ITEMS` (sidebar entries), the `<Routes>` for each master page, the collapsible desktop sidebar + mobile drawer, and the auth guard. Adding a new master means adding a page, a service, a `NAV_ITEMS` entry, and a `<Route>`.
- **Auth is a mock** — [src/lib/auth.js](front-end-master/src/lib/auth.js) checks hardcoded `admin` / `admin123` and sets a `localStorage` flag (`mp-auth`). No tokens are sent to the API.
- **Services** — `src/services/<entity>Service.js`, one per entity, each a default-exported object of thin axios calls (`getX`, `getXById`, `createX`, `updateX`, `deleteX`) against `${VITE_API_BASE_URL}/api/<Entity>`. No shared axios instance or interceptors. Pages use `response.data` directly.
- **Pages** — `src/pages/<Entity>.jsx`, each a self-contained CRUD screen following the same template (see [Division.jsx](front-end-master/src/pages/Division.jsx) as the simplest reference):
  - `load<X>()` on mount; list + search filter via `useMemo`; skeleton rows while loading; empty state.
  - Add/Edit in `<FormDialog>`; edit fetches by id first; `fieldErrors` object shown via `<FormError>` and cleared per-field on change.
  - Client-side validation includes a case-insensitive **duplicate name check** against the loaded list (excluding the current record when editing).
  - `status` is the string `"Active"` / `"Inactive"`, edited with `<StatusToggle>`.
  - Delete uses `await confirmAction({...})` from `useConfirm()`.
  - Dependent pages load lookup lists from other services for `<Select>` dropdowns (e.g. Machine ← Plant/Division, Project ← Machine, Components ← Project/Machine, Activities ← Components, SubActivities ← Activity/Components, Employee ← Designation/Shift). Machine also renders a QR code (`qrcode.react`).
- **Feedback** — always report errors with `notifyError(err, "Fallback message.")` and successes with `notifySuccess(msg)` from [src/lib/notify.js](front-end-master/src/lib/notify.js). It uses [api-error.js](front-end-master/src/lib/api-error.js) to extract the backend message (handles ASP.NET `{ errors: { Field: [...] } }`, `message`, `detail`, `title`, ignores HTML error pages) and dedupes toasts by id. Toasts are react-hot-toast mounted by `AppToaster`.
- **Global providers** — [src/main.jsx](front-end-master/src/main.jsx) wraps the app in the MUI `ThemeProvider` (custom palette) and `ConfirmProvider`. `StrictMode` is intentionally commented out.

## UI components

`src/components/ui/*` look like shadcn/ui (same names and APIs: `Button` variants `default|destructive|outline|secondary|ghost|link|success`, sizes `default|sm|lg|icon`, `Card`, `Table`, `Select`, `Badge`, etc.) but are **implemented on top of MUI**, styled via `sx` using the CSS variables from [src/index.css](front-end-master/src/index.css). Tailwind v4 (via `@tailwindcss/vite`, tokens in `@theme inline`) is used for layout/utility classes alongside them; combine classes with `cn()` from `@/lib/utils`. Import UI primitives via the `@/` alias (→ `src/`). Modals should use MUI `Dialog` through `FormDialog` / `ConfirmProvider` rather than new dialog implementations.

The React Compiler is enabled via Babel in [vite.config.js](front-end-master/vite.config.js).
