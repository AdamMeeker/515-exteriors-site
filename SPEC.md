# RoofingIQ Website — Build Spec

## Purpose
Marketing/demo website for the "RoofingIQ by Meeker Technologies" concept, targeted at Georgia (office manager) and Chris (owner) of 515 Exteriors, a Des Moines area roofing company.

This is a password-protected concept demo site. The goal: make Georgia and Chris say "we want this."

## Brand
- **Product name:** RoofingIQ
- **Tagline:** "Your market. Before your competitors see it."
- **Secondary:** "Powered by Meeker Technologies"
- **Tone:** Smart, confident, not salesy. Intelligence platform vibes, not roofing-company vibes.
- **Color palette:**
  - Background: #0f172a (deep navy)
  - Primary accent: #3b82f6 (blue)
  - Opportunity green: #22c55e
  - Alert amber: #f59e0b
  - Text: #f1f5f9 (light)
  - Muted: #64748b

## Stack
- Pure HTML + CSS + vanilla JS (no framework — Azure Static Web Apps free tier)
- Leaflet.js for the interactive map
- Chart.js for any analytics visuals
- Azure Functions (Node.js) for the feedback form API endpoint
- `staticwebapp.config.json` for Azure SWA configuration

## File Structure
```
515-exteriors-site/
├── index.html              ← Main landing page (all sections)
├── demo.html               ← Full-screen interactive demo
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js         ← Landing page interactivity
│       └── demo.js         ← Interactive demo logic
├── data/
│   └── permits.json        ← Mock permit/opportunity data
├── api/
│   └── feedback/
│       └── index.js        ← Azure Function: save feedback
├── staticwebapp.config.json
└── README.md
```

## index.html — Sections

### 1. Navigation
- Logo: "RoofingIQ" with small "by Meeker Technologies" subtitle
- Nav links: How It Works, The Intelligence, Demo, Contact
- CTA button: "See the Demo →"

### 2. Hero
- Big headline: "Your market. Before your competitors see it."
- Subhead: "RoofingIQ monitors building permits, city council approvals, and storm data across Des Moines — pushing qualified leads directly into AccuLynx before your competitors even know the job exists."
- Two CTAs: "Explore the Demo" and "Share Your Feedback"
- Background: subtle animated gradient or dark mesh

### 3. The Problem (3 pain points as cards)
- "You find out about jobs after they've been quoted" → Permit data shows opportunities 2-4 weeks before homeowners start calling
- "Market intelligence takes hours you don't have" → Automated monitoring runs 24/7, you get a briefing
- "Your CRM only knows jobs you already have" → RoofingIQ finds the next 10 jobs and pushes them in

### 4. How It Works (3 steps, horizontal)
1. **Monitor** — Building permits, city council minutes, storm events, competitive activity — automatically scraped and analyzed nightly
2. **Score** — AI ranks each opportunity by probability, project size, timing, and your company's historical win patterns
3. **Act** — Qualified leads delivered to AccuLynx every morning. Georgia opens the CRM and the work is already there.

### 5. Intelligence Feeds (3 columns with icons)
- **Building Permits** — New construction + re-roof permits across Des Moines metro. Commercial threshold alerts. 6-18 month lead time on new builds.
- **Council & Zoning** — City council approvals, planning commission decisions, commercial development projects. Know about the new strip mall before the GC does.
- **Storm Intelligence** — Hail and wind events overlaid with property age data. Auto-generate canvassing routes ranked by damage probability.

### 6. AccuLynx Integration (feature callout)
- Logo + "Works with your existing system"
- "RoofingIQ connects directly to AccuLynx via API. New leads land in your pipeline automatically — with source data, opportunity score, and suggested action. No duplicate entry. No new software to learn."

### 7. Georgia's Day (Before / After comparison)
**Before RoofingIQ:**
- Morning: check email, chase job status, manually log yesterday's leads
- Afternoon: draft follow-up emails from scratch, coordinate with adjusters
- End of day: search for tomorrow's upcoming jobs

**After RoofingIQ:**
- Morning: 3 pre-qualified leads already in AccuLynx from overnight monitoring
- Intelligence brief: 2 council approvals flagged (commercial development in Ankeny)
- AI-drafted follow-up emails ready to review and send
- Storm alert: 847 properties in targeted neighborhood need outreach

### 8. Chris's Market Intelligence (screenshot/mockup of dashboard)
- Revenue pipeline forecast
- Opportunity map (teaser of the live demo)
- Competitive heat map description

### 9. Interactive Demo CTA
- "See real Des Moines market data →" big button linking to demo.html
- Note: "Sample data shown for demonstration purposes"

### 10. Engagement / Pricing
Three tiers (clean card layout):
- **Starter** — Georgia's AI Assistant + AccuLynx integration: $2,500 setup + $500/mo
- **Growth** — Starter + Permit & Council monitoring + opportunity graph: $5,000 setup + $700/mo  
- **Full Intelligence** — Everything + Chris's dashboard + competitive intel: $8,000 setup + $900/mo
- Small print: "Month-to-month. No long-term contracts."

### 11. Feedback Form
- Section header: "Tell us what you think"
- Subtext: "We built this for you. Your feedback shapes what gets built."
- Fields:
  - Name (text)
  - Email (text)
  - Role (select: Office Manager / Owner / Other)
  - "Which features matter most to you?" (checkboxes: Permit monitoring, Council minutes, Storm intelligence, AccuLynx integration, Georgia's assistant, Chris's dashboard)
  - "What would make this a no-brainer for 515 Exteriors?" (textarea)
  - "How interested are you in learning more?" (radio: Very interested / Somewhat interested / Not yet / Just browsing)
  - Submit button: "Send Feedback →"
- On submit: show success message, POST to /api/feedback

### 12. Footer
- "RoofingIQ by Meeker Technologies"
- "adam@meekertechnologies.com"
- "Sample data shown for demonstration purposes. © 2026 Meeker Technologies."

---

## demo.html — Interactive Demo

Full-screen layout with:
- Left panel (30%): Opportunity feed (scrollable list of leads)
- Right panel (70%): Leaflet.js map

### Map Setup
- Center: Des Moines, Iowa (41.5868, -93.6250)
- Zoom: 11
- Tile layer: CartoDB Dark Matter (matches dark theme)
- URL: https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png

### Mock Data (permits.json) — 25 realistic records
Create realistic Des Moines metro records with these fields:
```json
{
  "id": "unique string",
  "type": "new_construction" | "reroof" | "commercial" | "council_approval" | "storm_lead",
  "address": "real-sounding Des Moines metro address",
  "neighborhood": "actual Des Moines neighborhood name",
  "city": "Des Moines" | "Ankeny" | "West Des Moines" | "Johnston" | "Waukee" | "Urbandale",
  "lat": number,
  "lng": number,
  "value": number (project estimated value in dollars),
  "date": "ISO date string (within last 30 days)",
  "source": "Building Permit" | "Council Approval" | "Storm Alert" | "Competitive Intel",
  "description": "1-2 sentence description of the opportunity",
  "opportunity_score": number (1-10),
  "days_old": number,
  "status": "new" | "hot" | "warming",
  "acculynx_ready": boolean
}
```

Use real Des Moines area coordinates! Mix of neighborhoods:
- Beaverdale (~41.615, -93.660)
- East Village (~41.592, -93.611)
- Ankeny (~41.726, -93.598)
- West Des Moines (~41.577, -93.711)
- Johnston (~41.673, -93.697)
- Waukee (~41.610, -93.889)
- Urbandale (~41.627, -93.712)
- Clive (~41.607, -93.728)

### Map Markers
- New construction: blue circle marker
- Re-roof: orange circle marker  
- Commercial: purple circle marker
- Council approval: green circle marker (flag icon)
- Storm lead: red triangle marker

### Marker popup on click
Show: address, type, value, opportunity score, description, "Push to AccuLynx" button (shows toast "Lead pushed to AccuLynx! ✓")

### Left Panel — Opportunity Feed
- Header: "Opportunities" with count badge and "Last updated: Today 6:00 AM"
- Filter tabs: All | Permits | Council | Storm | Commercial
- Each card:
  - Type badge (color-coded)
  - Address + city
  - Opportunity score (1-10 with color: green 8-10, yellow 5-7, orange <5)
  - Value ($XXX,XXX)
  - Days since posted
  - "Push to AccuLynx →" button

### Stats bar at top of demo page
- Total opportunities: 25
- High-priority (score 8+): X
- New this week: X  
- Est. pipeline value: $X.XM

### "Sample Data" disclaimer banner
Subtle banner at top: "📊 This demo uses realistic sample data for the Des Moines metro area. Live system connects to real permit databases, council records, and storm monitoring."

---

## api/feedback/index.js — Azure Function

Azure Function v4 (Node.js):
- POST endpoint at /api/feedback
- Receives JSON body with form fields
- Saves to a JSON file in Azure Blob Storage OR emails via mailto (since we don't have Azure Storage set up yet, write to a local JSON file / log for now, and include a TODO comment for production)
- Simple approach: just log the submission + return 200 (Adam will see it in Azure logs)
- Include CORS headers
- Validate required fields (name, email)
- Return JSON: { success: true, message: "Thank you for your feedback!" }

For now: save to a simple append-to-file approach (the function will log it, and we can add email/storage later).

Actually — use a simpler approach: just POST the data to a Formspree-style endpoint... no, we want custom. Let's just have the Azure Function write a JSON log entry and return success. Production TODO: send email to adam@meekertechnologies.com.

---

## staticwebapp.config.json

```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "auth": {
    "identityProviders": {}
  },
  "responseOverrides": {
    "401": {
      "redirect": "/.auth/login/aad",
      "statusCode": 302
    }
  },
  "globalHeaders": {
    "X-Frame-Options": "SAMEORIGIN"
  }
}
```

Note: We'll use Cloudflare Access for auth, not Azure's built-in auth. So actually keep routes open and let Cloudflare handle it. Remove auth restrictions from staticwebapp.config.json. Cloudflare Access will sit in front and require a one-time email OTP (zero-config, free tier).

---

## Design Details

### Typography
- Font: Inter (Google Fonts)
- Hero heading: 72px, weight 800
- Section headings: 48px, weight 700
- Body: 16px, weight 400, line-height 1.6

### Animations
- Fade-in on scroll (Intersection Observer)
- Opportunity score counter animation on load
- Map markers pulse animation on load
- Demo feed auto-scrolls slowly when no interaction

### Mobile
- Responsive: demo.html collapses to full-width map with slide-up panel
- index.html: single column on mobile

### Key Visual: The Intelligence Clock
In the "How it Works" section, show a visual of:
"While you sleep, RoofingIQ monitors 47 data sources across the Des Moines metro..."
with a subtle animated background element

---

## README.md
Include:
- Project description
- Local dev: `npx serve .` or just open index.html
- Deploy to Azure Static Web Apps (GitHub Actions workflow)
- Cloudflare Access setup steps
- Feedback form setup notes

---

## Important Notes
1. ALL external links open in new tab
2. No jQuery — vanilla JS only
3. Leaflet.js from CDN: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
4. Chart.js from CDN: https://cdn.jsdelivr.net/npm/chart.js
5. Inter font from Google Fonts
6. Test that feedback form shows success state without page reload
7. "Push to AccuLynx" buttons are purely visual (show a toast notification)
8. Make it genuinely impressive — this is a sales tool

When completely finished, run this command to notify:
openclaw system event --text "515 Exteriors RoofingIQ website build complete. Ready for review at ~/Projects/515-exteriors-site/" --mode now
