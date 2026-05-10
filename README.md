# RoofingIQ — by Meeker Technologies

Marketing + interactive demo site pitching the **RoofingIQ** intelligence platform to **515 Exteriors** (Des Moines, IA).

> Tagline: *Your market. Before your competitors see it.*

This is a **password-protected concept demo** — the goal is to make Georgia (office manager) and Chris (owner) say *"we want this."*

---

## Stack

- **Frontend:** Pure HTML + CSS + vanilla JS (no framework)
- **Mapping:** [Leaflet.js](https://leafletjs.com/) 1.9.4 (CDN) with CartoDB Dark Matter tiles
- **Charts:** [Chart.js](https://www.chartjs.org/) (CDN)
- **Fonts:** Inter (Google Fonts)
- **Backend:** Single Azure Function (`/api/feedback`) — Node.js
- **Hosting:** Azure Static Web Apps (free tier)
- **Auth (planned):** Cloudflare Access in front (one-time email OTP, free tier)

---

## File Layout

```
515-exteriors-site/
├── index.html              ← Landing page (all sections)
├── demo.html               ← Full-screen interactive demo
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── main.js         ← Landing page interactivity
│       └── demo.js         ← Map + opportunity feed
├── data/permits.json       ← 25 mock Des Moines metro records
├── api/
│   ├── feedback/
│   │   ├── index.js        ← Azure Function: POST /api/feedback
│   │   └── function.json
│   ├── host.json
│   └── package.json
├── staticwebapp.config.json
└── README.md
```

---

## Local Development

The site is fully static — no build step.

**Quickest:** open `index.html` in a browser. (The demo's `fetch('data/permits.json')` will work over `file://` in Safari but is blocked in Chrome — use a local server for full fidelity.)

**Recommended local server:**

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:3000` (or whatever port the server picks).

The feedback form will gracefully fall through to a "saved locally" success state when the API isn't running — submissions are logged to the browser console for inspection during local dev.

---

## Deploy to Azure Static Web Apps

### One-time setup

1. **Create the SWA resource** in the Azure portal (free tier).
2. Connect it to this repo (GitHub). Azure auto-generates a workflow file at `.github/workflows/azure-static-web-apps-*.yml`.
3. **Build configuration** in the workflow should be:
   - `app_location: "/"`
   - `api_location: "api"`
   - `output_location: ""`  *(empty — static files live at the root)*

That's it. Push to `main` and the workflow deploys both the static site and the function.

### Verify the API endpoint

```bash
curl -X POST https://<your-app>.azurestaticapps.net/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"name":"Adam","email":"adam@meekertechnologies.com","interest":"Very interested"}'
```

Expected: `{"success":true,"message":"Thank you for your feedback!"}`

Submissions show up in the function's log stream (Portal → Static Web App → Functions → `feedback` → Logs).

---

## Cloudflare Access (Auth) — Setup

The site itself is open inside Azure (`staticwebapp.config.json` allows `anonymous`). Auth is enforced by **Cloudflare Access** sitting in front of the custom domain.

1. Add the SWA as a CNAME record in your Cloudflare zone (e.g. `roofingiq.meekertechnologies.com → <app>.azurestaticapps.net`). Set proxy ON (orange cloud).
2. In Cloudflare Zero Trust → **Access → Applications → Add Application**:
   - Type: *Self-hosted*
   - Domain: `roofingiq.meekertechnologies.com`
   - Session duration: 24 hours
3. Add a policy: *"Email allowlist"* — list Georgia, Chris, and Adam's emails.
4. Identity provider: *One-Time PIN* (zero-config; sends a 6-digit code to the visitor's email).

Visitors land on the Cloudflare login page, enter their email, get a code, and they're in. No accounts to manage.

---

## Feedback Form — Production Notes

The current `api/feedback/index.js` logs to the function host. For production:

- **Email path (simplest):** add a SendGrid/Resend API key to SWA Application Settings, send a transactional email to `adam@meekertechnologies.com`.
- **Persistence path:** add `@azure/storage-blob` and append each submission as a JSON blob (one per response or appended into a daily NDJSON file).
- **Combo:** do both — email Adam in real time, persist for the record.

A `// TODO (production)` comment marks the integration point in `index.js`.

---

## Mock Data

`data/permits.json` contains 25 realistic Des Moines metro records — a mix of:

- **Re-roofs** (residential)
- **New construction** (single-family + production builder)
- **Commercial** (office / retail / warehouse)
- **Council approvals** (planning commission decisions)
- **Storm leads** (hail / wind events with property-age overlay)

All coordinates are real Des Moines addresses (Beaverdale, East Village, Ankeny, West Des Moines, Johnston, Waukee, Urbandale, Clive, etc.), and project values are sized to match real Iowa roofing economics.

---

## Customization

- **Colors:** edit CSS custom properties at the top of `assets/css/style.css`.
- **Pricing tiers:** in `index.html` under the `#pricing` section.
- **Feed filters:** in `demo.html` under `.feed-tabs`, then map to filter logic in `assets/js/demo.js` (`filterMatch` function).
- **Map center / zoom:** in `assets/js/demo.js` (`initMap` function).

---

## Contact

**Adam Meeker** · adam@meekertechnologies.com
