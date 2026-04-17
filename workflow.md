# Florida New Construction — User Workflow

## The 4-layer drill-down model

```
Layer 1 (State)  →  Layer 2 (County)  →  Layer 3 (Subdivision)  →  Layer 4 (History)
   choropleth        pins + builders       detail snapshot           time-series
```

---

## Layer 1 — Landing (Regional Heatmap)

**What the user sees**
- Full Florida map, 23 counties colored by chosen metric
- Left sidebar: ranked list of counties
- Right sidebar: "Click a county to see details"
- Header: **Metric toggle** (Velocity / Median Price) + **Home Type toggle** (SFH / Townhome)

**What they can do**

| Action | Result |
|---|---|
| Click metric toggle | Recolor map (velocity ↔ price palette) |
| Click home type toggle | Re-fetch all county metrics (SFH ↔ Townhome) |
| Hover a county polygon | Tooltip: absorption, median, closed count |
| Click a county **(on map OR in sidebar)** | → Layer 2 |

---

## Layer 2 — County Operating View

**Trigger:** user clicked a county polygon or row.

**Map behavior**
- `fitBounds` zooms into the county (1.2s animation)
- Selected county highlighted with white border + 48% fill
- Other 22 counties still visible (dimmed at 40%)
- Subdivision **pins appear** inside the county, color-coded by velocity tier

**Panel layout (proposed)**

```
┌────────── HEADER ──────────────────────────────────┐
│ Florida › Orange County    [← Back]   [Toggles]    │ ← breadcrumb
├──────────┬──────────────────────────┬──────────────┤
│          │ ┌─ County KPI Bar ─────┐ │              │
│ County   │ │ Inv │ Vel │ Med │ MoS │ │ Builder     │ ← top of right
│ Ranking  │ └─────────────────────┘ │ Market      │   panel
│          │                          │ Share        │
│ Orange✓  │      MAP                 │              │
│ Hills    │      + pins              │ Lennar  24%  │
│ Duval    │      + county outline    │ D.R.H.  18%  │
│          │                          │ Meritage 12% │
│          │                          │              │
│          │                          │ [Filter ▾]   │
│          │                          │              │
│          │                          │ ─── New vs   │
│          │                          │     Resale ─ │
│          │                          │ Inv 412→890  │
│          │                          │ Vel 12%→ 8%  │
└──────────┴──────────────────────────┴──────────────┘
```

**What they can do**

| Action | Result |
|---|---|
| Hover a pin | Tooltip: name, builder, absorption, median |
| Click a pin | Right panel switches to **SubdivisionSpotlight** (partial Layer 3) |
| Click another county | Zoom to new county, pins update, selected subdivision clears |
| Click the selected county again (or "Back") | Zoom out to Layer 1, pins hide, right panel resets |
| Click a builder row in market-share panel | Filter pins to that builder only |
| Change Home Type toggle | Pins + KPIs + builder share refetch for SFH/Townhome |

---

## Layer 3 — Subdivision Detail (future)

**Trigger:** user clicked a pin on Layer 2.

Right panel expands into a full detail view:
- Lot size breakdown (50×120, 40×120, etc.)
- Velocity by lot size (monthly sales count per tier)
- Median price by lot size
- Remaining lots inventory by tier
- Concessions / incentives
- Button: **"View history →"** opens Layer 4

---

## Layer 4 — Historical Trend (future)

**Trigger:** user clicked "View history" on Layer 3.

Full-screen takeover with:
- Line charts: absorption, median price, concession rate from subdivision inception to today
- Toggle chart type (SFH / Townhome / combined)
- CSV / PDF export buttons
- Back button → Layer 3

---

## State machine (Redux)

```
{ selectedCounty, selectedSubdivision, metric, homeType, builderFilter? }

                 ┌─ setMetric          ─┐
                 ├─ setHomeType         │  (always available)
                 │                      │
[L1]             │                      │
  └─ setCounty(X) ──────────────→ [L2 with county X]
                                    │
                                    ├─ setSubdivision(Y) ──→ [L3 for Y]
                                    │                            │
                                    │                            ├─ openHistory ──→ [L4 for Y]
                                    │                            └─ close ────────→ [L2]
                                    │
                                    ├─ setCounty(null) ──→ [L1]
                                    └─ setCounty(Z) ─────→ [L2 with county Z, subdivision cleared]
```

**Invariant already enforced in the slice:** changing county auto-clears `selectedSubdivision`.

---

## Data-fetching flow

```
mount                       → useCountyMetrics(metric, homeType)     → /api/heatmap/counties
selectedCounty changes      → useSubdivisionPins(county, homeType)   → /api/heatmap/subdivisions
selectedCounty changes      → useResaleCompos(county, homeType)      → /api/heatmap/resale      ← to add
selectedSubdivision changes → useSubdivisionHistory(id)              → /api/heatmap/history     ← Layer 4
```

React Query handles caching — toggles between counties already visited are instant.

---

## Current status

- ✅ Layers 1 + 2 **core** (choropleth, pins, drill-down, spotlight)
- 🔸 Layer 2 **operating panels** (KPI bar, builder share, resale compare, breadcrumb) — next
- ⬜ Layer 3 full detail
- ⬜ Layer 4 history + export

**Recommendation:** finish Layer 2 panels (KPI + Builder Share + Breadcrumb) before touching Layer 3. That's what makes Layer 2 feel like the "county operating view" from the spec instead of just "Layer 1 zoomed in with dots."
