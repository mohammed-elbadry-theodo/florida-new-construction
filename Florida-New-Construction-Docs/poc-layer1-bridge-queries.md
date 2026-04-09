# POC — Layer 1 (Heatmap) Bridge RESO Web API Queries

This document lists the **query patterns** the backend will use for **Layer 1 — The Big Picture** (23-county Florida heatmap), based on Bridge Data Output **RESO Web API (OData)**.

> Important: the API is great at returning records, but it is **not** optimized for “distinct lists” or server-side aggregation.
> For the heatmap, the typical approach is:
> 1) replicate/pull records, 2) store in your DB, 3) compute county metrics (velocity, median price, inventory) in your DB.

---

## Variables (placeholders)

- `BASE` = `https://api.bridgedataoutput.com/api/v2/OData`
- `DATASET` = your approved MLS dataset code (example in docs: `dataset_id`)
- `TOKEN` = your Bridge **Server Token**

Auth options:
- Header: `Authorization: Bearer {TOKEN}` (recommended)
- Query string: `?access_token={TOKEN}` (fallback)

---

## Step 0 — Verify exact resource names + field availability

Bridge docs sometimes show `Property` vs `Properties` (and other naming differences across datasets). Use `$metadata` as the source of truth.

### 0.1 Get dataset metadata (required)

`GET {BASE}/{DATASET}/$metadata?access_token={TOKEN}`

Backend use:
- Confirm the **entity set name** you must query (e.g., `Property`, `Properties`).
- Confirm the exact field names you’ll rely on:
  - `CountyOrParish`, `City`, `PropertyType`, `PropertySubType`, `StandardStatus`
  - `ListPrice`, `ClosePrice`, `CloseDate`, `ListDate`
  - `Coordinates` (for pin placement / map calculations)
  - `BridgeModificationTimestamp` (for incremental updates)

---

## Step 1 — Target counties (the “list of counties”)

The 23 target counties are defined by product scope (see `Map.md`). The API **does not** provide a “counties” endpoint; we treat this list as **static configuration** and/or validate presence via listing data.

Recommended config list (from Map.md):
- St. Lucie
- Indian River
- Brevard
- Osceola
- Orange
- Seminole
- Lake
- Sumter
- Polk
- Hillsborough
- Manatee
- Pasco
- Hernando
- Citrus
- Marion
- Volusia
- Flagler
- St. Johns
- Clay
- Baker
- Alachua
- Duval
- Nassau

### 1.1 “Does this county have any listings?” (presence check)

Use a light query that returns only 1 record:

`GET {BASE}/{DATASET}/Property?$top=1&$select=ListingKey,CountyOrParish&$filter=CountyOrParish eq 'Orange'&access_token={TOKEN}`

---

## Step 2 — “Hometown” / City lists (derived)

If by “hometown” you mean **cities** inside the target counties, the API still won’t give you a `distinct City` list directly.

Two workable patterns:

### Pattern A (recommended): compute distinct cities in your DB

1) Pull all relevant property rows (replication or paged reads) selecting only `CountyOrParish` + `City`.
2) Compute `distinct (CountyOrParish, City)` in your DB.

### Pattern B (API-only): extract cities by paging through a county slice

This is acceptable for small datasets; it becomes expensive if there are many listings.

Example (page through Orange County, selecting only City):

`GET {BASE}/{DATASET}/Property?$top=200&$skip=0&$select=ListingKey,CountyOrParish,City&$filter=CountyOrParish eq 'Orange'&access_token={TOKEN}`

Then repeat with `$skip=200`, `$skip=400`, etc.

> If you need more than ~10,000 records, use replication (below).

---

## Step 3 — Layer 1 metric queries (building blocks)

## Step 3A — Finding `Closed` records (especially in the Test dataset)

If you’re using Bridge’s **Test dataset**, it may simply **not contain any closed transactions**. Before assuming your query is wrong, run a “discovery” query to see what status values exist and whether any rows have `CloseDate` / `ClosePrice` populated.

### 3A.1 Discovery: show the most recently closed-looking records

This does **not** require `StandardStatus` to be exactly `Closed` — it looks for rows with a `CloseDate`.

`GET {BASE}/{DATASET}/Property?$top=200&$select=ListingKey,StandardStatus,CloseDate,ClosePrice,CountyOrParish,City&$filter=CloseDate ne null&$orderby=CloseDate desc&access_token={TOKEN}`

If this returns **zero rows**, your dataset likely has no closed history available.

### 3A.2 Discovery: show rows with a `ClosePrice`

`GET {BASE}/{DATASET}/Property?$top=200&$select=ListingKey,StandardStatus,CloseDate,ClosePrice,CountyOrParish,City&$filter=ClosePrice ne null&$orderby=CloseDate desc&access_token={TOKEN}`

### 3A.3 Strict: only `StandardStatus = Closed` (case-safe)

If your dataset does have closed rows, this should work:

`GET {BASE}/{DATASET}/Property?$top=200&$select=ListingKey,StandardStatus,CloseDate,ClosePrice&$filter=tolower(StandardStatus) eq 'closed'&$orderby=CloseDate desc&access_token={TOKEN}`

If you still get nothing, try common alternatives used by some MLS payloads:

`...&$filter=tolower(StandardStatus) eq 'sold'`

> Reminder: exact resource names and status values vary by MLS dataset. Use `$metadata` + a few sample pulls to confirm what your dataset actually returns.

Layer 1 requires:
- **Inventory** (Active count)
- **Median price** (Active median list price, or closed median close price depending on definition)
- **Velocity** (Closed count over a window, e.g., last 30/60/90 days)
- Filters:
  - **home type** (SFH vs Townhome) — usually derived from `PropertyType`/`PropertySubType`

Because server-side aggregation is limited, these queries are designed to **pull records** and let your backend compute metrics.

### 3.1 Pull Active inventory records for a county (minimal fields)

`GET {BASE}/{DATASET}/Property?$top=200&$skip=0&$select=ListingKey,StandardStatus,CountyOrParish,City,PropertyType,PropertySubType,ListPrice,Coordinates,BridgeModificationTimestamp&$filter=CountyOrParish eq 'Orange' and StandardStatus eq 'Active'&access_token={TOKEN}`

Home-type filtering example (you must confirm values in your dataset):

`...&$filter=CountyOrParish eq 'Orange' and StandardStatus eq 'Active' and (PropertySubType eq 'Townhouse')`

### 3.2 Pull Closed sales for velocity (last N days)

Example for last 90 days (adjust `CloseDate` threshold):

`GET {BASE}/{DATASET}/Property?$top=200&$skip=0&$select=ListingKey,StandardStatus,CountyOrParish,City,PropertyType,PropertySubType,CloseDate,ClosePrice,BridgeModificationTimestamp&$filter=CountyOrParish eq 'Orange' and StandardStatus eq 'Closed' and CloseDate ge 2025-12-23&access_token={TOKEN}`

Backend computes:
- `velocity = count(closed_sales_in_window)` (optionally normalized per week/month)
- `median_close_price`

### 3.3 Pull “price snapshot” for median list price (Active)

`GET {BASE}/{DATASET}/Property?$top=200&$skip=0&$select=ListingKey,CountyOrParish,PropertyType,PropertySubType,ListPrice,StandardStatus&$filter=CountyOrParish eq 'Orange' and StandardStatus eq 'Active' and ListPrice ne null&access_token={TOKEN}`

Backend computes:
- `median_list_price`

### 3.4 Multi-county pulls (recommended approach)

Instead of running 23 separate county queries, you can pull *all* relevant records and bucket them by county in your DB.

Example: all Active listings in your dataset (then filter to the 23 counties in code):

`GET {BASE}/{DATASET}/Property?$top=200&$skip=0&$select=ListingKey,CountyOrParish,City,StandardStatus,PropertyType,PropertySubType,ListPrice,Coordinates,BridgeModificationTimestamp&$filter=StandardStatus eq 'Active'&access_token={TOKEN}`

Then:
- Filter down to the 23 counties
- Compute county-level rollups

---

## Step 4 — Replication (best for “heatmap + history”)

If the MLS allows replication, use this for seeding and incremental sync.

### 4.1 Seed + incremental sync

`GET {BASE}/{DATASET}/Property/replication?access_token={TOKEN}`

Notes (from Bridge docs):
- Use `BridgeModificationTimestamp` for incremental updates.
- Replication returns a `next` link in response headers.
- `$top` max is **2,000** on replication.

### 4.2 Reduce payload size (recommended)

Use `$select` to pull only Layer-1-needed fields:

`GET {BASE}/{DATASET}/Property/replication?$select=ListingKey,StandardStatus,CountyOrParish,City,PropertyType,PropertySubType,ListPrice,CloseDate,ClosePrice,Coordinates,BridgeModificationTimestamp&access_token={TOKEN}`

---

## Practical backend workflow for Layer 1

1) **Nightly seed** (one-time) via replication until complete.
2) **Incremental sync** every 5–15 minutes using replication `next` links.
3) Write incoming rows into your DB (upsert by `ListingKey`).
4) Compute (and cache) county rollups:
   - Active count
   - Closed count in last N days
   - Median list price / median close price
   - Breakdowns by home type (SFH vs Townhome)
   - Optional: city list per county

---

## Things that will vary by MLS dataset (confirm in `$metadata`)

- Resource/entity-set names: `Property` vs `Properties`
- Home-type classification values in `PropertyType`/`PropertySubType`
- Whether `Coordinates` is present
- Whether `CloseDate` and `ClosePrice` are available under your license/feed type
- Whether replication is enabled
