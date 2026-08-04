# Frontend — CLAUDE.md

## Setup & Tech Stack

- **Build tool:** Vite `^5` (React plugin, port 5173, `--host`)
- **Framework:** React `^18` + React Router DOM `^6`
- **Styling:** Tailwind CSS `^3.4` + custom design system in `src/index.css`
  (`glass-card`, `btn-primary`, `btn-secondary`, `nav-link*`, `input-field`, `animate-in`)
- **Maps:** `@react-google-maps/api` (Google Maps script loaded in `App.jsx` via `LoadScript`,
  `libraries={["places"]}`, key from `VITE_GOOGLE_MAPS_API_KEY`)
- **HTTP:** axios service in `src/services/api.js` (base URL from `VITE_API_URL`,
  default `http://localhost:5000/api`)

## Frontend File Structure

```
frontend/src/
├── App.jsx              # LoadScript + sticky nav + <Routes>
├── main.jsx             # React root + BrowserRouter
├── index.css            # Tailwind + design system
├── services/api.js      # shopService (axios) methods
└── pages/
    ├── Dashboard.jsx    # Searchable shop table + upcoming birthdays banner
    ├── AddShop.jsx      # Form with draggable map marker + geolocation
    ├── MapView.jsx      # Interactive map with markers + InfoWindow
    └── ShopDetail.jsx   # Single-shop profile
```

## UI Patterns & State Management

1. **Routes** — `App.jsx` owns navigation and `LoadScript`. Add new pages as components in
   `pages/` and register them in `<Routes>`.
2. **API calls** — Never call axios directly in components. Add a method to
   `services/api.js` (`shopService`) and call it from `useEffect` / event handlers.
3. **Local state** — Use React hooks (`useState`, `useEffect`, `useCallback`) for component
   state. There is no global state store; keep state local unless a shared store is added.
4. **Styling** — Reuse the design-system classes in `index.css`. Use Tailwind utility classes
   and the green palette (`green-600`, `emerald-*`). Match existing visual patterns.
5. **Map interactions** — Use `useCallback` for handlers that reference Google Maps APIs
   (e.g., `geocodePosition`, `handleDragEnd`). Respect the marker/center state pattern.
6. **Loading & errors** — Every page shows a spinner while loading and an inline error banner
   on failure. Keep `loading` / `error` state per page.

## Strict Workflow Rules (အတိအကျ လိုက်နာရမည်)

1. **Language Requirement (ဘာသာစကား):** All responses, status updates, and implementation
   plans **MUST be written in Myanmar Language (မြန်မာဘာသာ)**.

2. **Plan First Principle (ဦးစွာ စီမံချက်ဆွဲခြင်း):** Whenever asked to make a change, add a
   feature, or fix a bug, **NEVER write or modify code directly.** Draft a detailed
   Implementation Plan in Myanmar Language first.

3. **Auto-Save Plan Files (Plan ဖိုင်များ အလိုအလျောက် သိမ်းဆည်းခြင်း):** Auto-save every plan
   into `frontend/plans/` as `YYYY-MM-DD-short-description-plan.md`
   (e.g., `2026-07-27-add-shop-form-validation-plan.md`).

4. **Wait for Explicit Approval (ခွင့်ပြုချက် စောင့်ဆိုင်းခြင်း):** Show the plan in Myanmar
   Language. **DO NOT touch any code or execute any file-modification commands** until the
   user explicitly says **"OK"**, **"Go ahead"**, or grants permission.
