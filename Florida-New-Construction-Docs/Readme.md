# Florida New Construction

An interactive analytics platform for tracking newly constructed residential subdivisions across 23 target counties in Florida. The platform provides real-time visibility into sales velocity, median pricing, builder market share, lot size mix, and resale comparable inventory — all segmented by product type (Detached Single-Family Home and Townhome).

## Summary

This repository contains the working materials for the **MAS Development – Florida New Construction** platform concept. It’s intended to capture the product vision and high-level platform overview (requirements, scope, and supporting docs) as the project is defined and refined.

Primary reference document: **MAS Development - Platform Concept Overview.pdf**

## Map
here is the map file for the the conties visualtion 
[Map file](Map.md)

**All 23 counties are not separated at all. They form one large, mostly connected territory.**

---
Layer 1 — The Big Picture: You land on a heat map of all 23 Florida counties. You can toggle between metrics (velocity vs. price) and filter by home type (SFH vs. Townhome).

Layer 2 — County View: You click on a county and zoom in. Now you see individual subdivision pins on the map, builder market share, and resale comparable data for that county.

Layer 3 — Subdivision View: You click a specific subdivision pin and get the detailed snapshot — lot sizes, pricing, inventory breakdown, builder info.

Layer 4 — Historical View: You go one level deeper into a subdivision's full history — time-series charts from when it was first built all the way to today.

=> those i need to get the data from the API

## 3.2 Core Objectives

1. Provide a regional heat map across 23 target counties with county-level granularity for
sales velocity and median sales price.
2. Enable seamless drill-down from state to county to subdivision to historical trend views.
3. Segment all pricing and velocity data by product type (Detached SFH and Townhome)
and by lot size where data permits.
4. Track builder market share and active pipeline at the county (submarket) level.
5. Compare new construction velocity and pricing against resale comparable inventory
(homes built within 5 years) at both the county and subdivision level.
6. Surface leading indicators of pricing pressure through incentive/concession tracking.
FL New Construction Analytics
Page 6
7. Track historical performance since subdivision inception to reveal lifecycle trends.
8. Enable proactive monitoring through alerts and watchlists.
9. Integrate public, MLS, and third-party data sources with monthly refresh cadence
---

**Plan: Bridge API “Backend Needs” POC Doc**

I’ll produce one new markdown doc (suggested name: **poc-bridge-data-api-backend-needs.md**) that maps your 4-layer workflow from Readme.md + county scope from Map.md to the exact Bridge Data Output endpoints your backend must consume (RESO Web API for MLS + Public Records for comps).

**What goes in the new POC file (draft content/outline)**

**1) Purpose / Scope**
- Backend must power:
  - Layer 1: 23-county heatmap (velocity vs median price; filter SFH vs Townhome)
  - Layer 2: county detail (subdivision pins, builder share, resale comps)
  - Layer 3: subdivision detail (inventory breakdown, lot size mix, pricing)
  - Layer 4: subdivision history (time-series from inception → now)
- Source of truth: Bridge Data Output (MLS via RESO Web API) + Bridge Public Records (parcels/assessments/transactions) for resale/valuation context.

**2) API Base + Auth**
- Preferred transport for MLS: RESO Web API (OData)
  - Base: `https://api.bridgedataoutput.com/api/v2/OData`
  - Auth header: `Authorization: Bearer {server_token}`
  - Fallback: `?access_token={server_token}`
- Rate limits to design around: default 5,000 req/hr + burst (per docs); use `$select` heavily.

**3) “Platform Setup” Endpoints (you’ll call these first)**
- Approved datasets (discover dataset codes):
  - `GET https://api.bridgedataoutput.com/api/v2/OData/DataSystem?access_token={token}`
  - (Bridge Web API alternative) `GET https://api.bridgedataoutput.com/api/v2/datasets?access_token={token}`
- Metadata (confirm *exact* entity-set names + fields for your MLS dataset):
  - `GET https://api.bridgedataoutput.com/api/v2/OData/{dataset_id}/$metadata?access_token={token}`

**4) Core MLS Resources the backend should consume (RESO Web API)**
Note: resource naming can vary (docs show both `Property` and `Properties`). Treat `$metadata` as the source of truth and document whatever your dataset exposes.
- Properties / Listings (inventory + closed history + media):
  - List/search: `GET .../OData/{dataset_id}/Property?access_token={token}`
  - Single by key: `GET .../OData/{dataset_id}/Properties('{ListingKey}')?access_token={token}` (or the dataset’s actual key pattern)
  - Pagination: use `$top` (<=200) + `$skip` + `$orderby`
  - Media: returned on Property record as `Media` (no separate media endpoint per docs)
- Members (agents) and offices (for builder/agent context when needed):
  - `GET .../OData/{dataset_id}/Member?access_token={token}`
  - `GET .../OData/{dataset_id}/Office?access_token={token}`
  - Use `$expand` when it saves round-trips (and include the expanded navigation property in `$select` if you use `$select`)
- Open houses (if MLS exposes them):
  - `GET .../OData/{dataset_id}/OpenHouse?access_token={token}`
- Optional resources (MLS-dependent; only if present in metadata):
  - Rooms, UnitTypes, etc.

**5) Replication (highly recommended for your heatmap + historical layers)**
- Initial + incremental replication for large datasets:
  - `GET https://api.bridgedataoutput.com/api/v2/OData/{dataset_id}/Property/replication?access_token={token}`
- Incremental field guidance (per docs):
  - Use `BridgeModificationTimestamp` for incremental updates (more reliable than MLS `ModificationTimestamp`)
- Replication constraints to document:
  - Only if MLS grants replication; server-to-server only; `$skip`/`$orderby` not supported on replication.

**6) Derived “Lists” your UX needs (not first-class endpoints)**
Bridge doesn’t provide “Counties list” or “Subdivisions list” as separate resources; you derive them from Property fields and store them.
- Counties list (Layer 1 + filters):
  - Derive distinct values from `CountyOrParish` (field availability confirmed via `$metadata`)
  - Since OData distinct/groupby isn’t guaranteed here, compute distinct in your DB after replication/on-demand pulls
- Subdivisions list/pins (Layer 2):
  - Derive from subdivision-ish fields (varies by MLS): commonly `SubdivisionName`, `Subdivision`, `DevelopmentName`, etc.
  - Pin location: prefer listing `Coordinates` (or address geocoding fallback if coordinates absent)
- Builders list + market share (Layer 2/3):
  - Builder often isn’t normalized; derive from whichever fields are available (common patterns: `BuilderName`, `OwnerName`, custom namespaced fields)
  - Compute market share in DB (counts of active inventory and/or closed volume in a time window)
- Home type (SFH vs Townhome):
  - Derive from `PropertyType` / `PropertySubType` (or MLS-specific field); document your mapping rules per dataset

**7) Query Patterns by Workflow Layer (what the backend should do)**
- Layer 1 (heatmap, by county + home type):
  - Maintain replicated property table (or cached snapshots)
  - Compute metrics in DB:
    - Active inventory counts: `StandardStatus eq 'Active'`
    - Velocity: closed count over last N days using `StandardStatus eq 'Closed'` + `CloseDate`
    - Median pricing: `ListPrice` for active, `ClosePrice` for closed (depending on definition)
- Layer 2 (county detail):
  - Filter properties by `CountyOrParish`
  - Build subdivision dimension: distinct subdivision field + representative coordinate
  - Builder share: group by derived builder field
  - Resale comps: closed properties in county excluding “new construction” where possible (field varies; often inferred from `YearBuilt` or a new-construction flag if present)
- Layer 3 (subdivision detail):
  - Filter by county + subdivision field value
  - Inventory breakdown by status + home type
  - Lot size mix: use `LotSizeSquareFeet` / `LotSizeAcres` when available
- Layer 4 (historical view):
  - Use replicated change history snapshots (or periodic rollups) keyed by subdivision
  - Time-series from `CloseDate`, `ListDate`, `BridgeModificationTimestamp`

**8) Public Records Endpoints (Bridge) for resale/valuation context**
Use these to enrich comps/valuation and parcel-level context when MLS fields are weak/inconsistent.
- Parcels:
  - `GET https://api.bridgedataoutput.com/api/v2/pub/parcels?access_token={token}`
- Assessments:
  - `GET https://api.bridgedataoutput.com/api/v2/pub/assessments?access_token={token}`
- Transactions:
  - `GET https://api.bridgedataoutput.com/api/v2/pub/transactions?access_token={token}`
- Parcel-specific transactions:
  - `GET https://api.bridgedataoutput.com/api/v2/pub/parcels/{parcel_id}/transactions?access_token={token}`

**9) Verification Checklist (include this at bottom of the POC file)**
- Confirm dataset code works via `.../OData/DataSystem`
- Pull `.../{dataset}/$metadata` and record the exact entity set names (Property/Member/Office/OpenHouse) you’ll use
- Run a small `Property?$top=1` query and confirm `Media`, `Coordinates`, `CountyOrParish`, and any subdivision/builder candidate fields exist
- Confirm whether replication is allowed; if yes, test `Property/replication` and the `next` link

If you approve this outline, you can hand it off to an implementation agent to actually create the file in the repo exactly as described.****

---
## DATA needed

* in the 1st layer :
  *  County name, current month metric value, month-over-month change
  *  Velocity / Median Sales Price | Detached SFH / Townhome
* Layer 2 :


