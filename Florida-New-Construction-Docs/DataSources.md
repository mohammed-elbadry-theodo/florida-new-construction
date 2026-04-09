# MAS Platform — Data Sources & What You Get From Each

### Direct

> Velocity
> {{base_url}}/{{dataset_id}}/Property?access_token={{server_token}}
> &$filter=ListingContractDate lt 2025-03-01 and
>  (StatusChangeTimestamp gt 2025-03-01T00:00:00 or (StandardStatus eq 'Active' and date(CloseDate) ge 2025-03-01 and date(CloseDate) le 2025-03-31)) and
>  PropertyType eq 'Residential' and
>  CountyOrParish eq 'Orange'
> &$select=ListingKey,ListPrice,StandardStatus,ListingContractDate,StatusChangeTimestamp,CloseDate,CountyOrParish,SubdivisionName,PropertyType&$top=200

## 1. Bridge Interactive API (MLS / Primary Source)

> Main workhorse. Aggregates data from multiple MLS boards (Stellar MLS for Central/SW Florida, NE Florida MLS for Jacksonville area) into one single API.

### What you get from it

#### Closed Transactions (Sales Data)
- Closed sale date (month + year)
- Closed sale price
- Property type (Detached SFH or Townhome)
- Subdivision name as listed on MLS
- Builder / seller name (grantor on the deed)
- Square footage of the home
- Days on market

#### Active Listings (Inventory Data)
- Active listing count per subdivision
- Listing price
- Property type (SFH / Townhome)
- Year built (used to filter resale comps to homes built within 7 years)
- Subdivision name

#### Seller Concessions
- Whether a concession was given (yes/no flag)
- Concession dollar amount
- Concession type (closing cost credit, rate buydown, price reduction)

#### Lot Size Fields (when populated by listing agent)
- Lot frontage width (e.g. 50 ft)
- Lot depth (e.g. 120 ft)
- Lot acreage

### What you calculate from it
- Absorption rate = (monthly closed sales / active inventory at month start) × 100
- Median sales price per subdivision per month
- Price per square foot = closed price / sqft
- Month-over-month deltas
- Velocity tier (high / med / low) based on absorption rate thresholds
- Builder market share = (builder inventory / total county inventory) × 100
- Trailing 3-month average velocity per builder

### Coverage
- **Stellar MLS**: Orange, Osceola, Seminole, Lake, Polk, Hillsborough, Manatee, Pasco, Hernando, Brevard, Volusia, and others (Central/SW Florida)
- **NE Florida MLS**: Duval, St. Johns, Clay, Nassau, Baker, Alachua, Flagler

### Access
- RESTful API (commercial agreement required)
- Requires broker sponsor or MLS data licensing agreement
- Bridge aggregates both MLS boards into one endpoint — simplifies integration

### Important note
> MLS data is not 100% complete — not all listing agents fill in lot size fields or concession details. Plan for gaps and use fallback sources where needed.

---

## 2. County GIS / ArcGIS Portals (Map & Geographic Data)

> Used purely for the map layer. This is where you get the shapes and boundaries that power the heat map and subdivision pins.

### What you get from it

#### County Boundaries
- GeoJSON / Shapefile polygons for all 23 target counties
- Used to draw the choropleth heat map in Layer 1

#### Subdivision Plat Boundaries
- Polygon boundaries for each qualifying subdivision
- Used to place and draw subdivision shapes on the map in Layer 2

#### Parcel Data
- Individual parcel polygons (one per lot)
- Lot frontage width and depth (computed geometrically from parcel shape)
- Parcel ID numbers (used to cross-reference with deed records)
- Zoning classification per parcel

#### Coordinates
- Latitude / longitude centroid for each subdivision (used for map pins)

### Coverage
- Most FL counties publish via ArcGIS Online portals
- Also available via Florida Geographic Data Library (FGDL) — statewide bulk download from UF GeoPlan Center

### Access
- ArcGIS REST APIs (free, public)
- GeoJSON bulk downloads
- US Census Bureau TIGER/Line Shapefiles (for county boundaries — free, updated annually)

### Important note
> This is your primary fallback for lot size data when MLS fields are not populated. Parcel geometry lets you compute frontage × depth directly from the GIS polygon.

-> : If MLS is empty → use parcel geometry

---

## 3. County Clerk of Court (Deed Records & Plat Maps)

> The most authoritative source for transaction validation and subdivision identity. Think of it as your ground truth layer.

### What you get from it

#### Warranty Deed Records
- Official recorded sale date (the date that legally counts)
- Recorded sale price
- Grantor name (seller — usually the builder for new construction)
- Grantee name (buyer)
- Legal description of the property (references the plat)

#### Plat Maps
- Official subdivision name as recorded (the legal name)
- Total number of platted lots in the subdivision
- Lot dimensions for every lot in the plat (exact, authoritative)
- Plat recording date (used to qualify subdivisions — must be within last 10 years)
- Subdivision boundary description

### What you use it for
- Validate and cross-check MLS closed sale prices and dates
- Get the official subdivision name for Layer 3 header
- Get total platted lots count for Layer 3
- Confirm plat recording date to qualify the subdivision
- Identify the builder as seller/grantor on transactions

### Coverage
- County-specific — each of the 23 counties has its own Clerk of Court
- Some counties offer searchable online portals, others require CSV/bulk download
- Quality and format varies significantly by county

### Access
- Varies by county (some APIs, most web portals or downloadable files)
- No single unified access point — requires county-by-county integration

---

## 4. Local Municipality Permit Portals (Building Permits & COs)

> The only source for Certificate of Occupancy (CO) counts, which are critical for both qualifying subdivisions and calculating remaining inventory.

### What you get from it

#### Building Permits
- Permit issue date
- Permit type (new residential construction)
- Parcel ID / lot number
- Contractor / builder name
- Property address
- Sometimes lot size or lot dimensions

#### Certificates of Occupancy (CO)
- CO issue date
- Parcel ID / lot number that received the CO
- Confirms that a home is completed and livable

### What you use it for
- Count how many lots have received a CO → determines lots remaining (total platted lots minus CO count)
- Qualify subdivisions: must have at least one permit in last 24 months
- Exclude subdivisions that are 95%+ built out (CO count / total lots ≥ 0.95)
- Cross-reference lot numbers with plat maps to derive lot dimensions (fallback for lot size)

### Coverage
- Jurisdiction-specific — permits are issued by cities and counties, not a single state agency
- US Census Bureau Building Permits Survey provides county-level monthly counts as a supplement (free API, ~2 month lag)
- HUD SOCDS Building Permits Database provides annual/monthly counts at metro and county level

### Access
- Varies by municipality (web portals, some REST APIs)
- Census Bureau API (free) for aggregate counts
- Most granular and useful for permit-to-subdivision matching at the local portal level

### Important note
> This is the most fragmented data source. Each municipality has its own system. Budget extra time for integrating permit data across all 23 counties.

---

## 5. Zillow API (Resale Comparable Inventory)

> Only used for one specific panel — the New vs. Resale comparison in Layer 2. Everything else comes from MLS.

### What you get from it

#### Active Resale Listings
- Active listing count filtered by year built (within last 7 years)
- Listing price
- Property type (SFH / Townhome)
- County / geographic scope
- Days on market

#### Resale Closed Transactions
- Closed sale price for comparable resale homes (built within 7 years)
- Used to calculate resale median price and resale absorption rate

#### Market Trend Data
- Zestimates (Zillow automated valuations — supplemental context only)
- Regional market trend indices

### What you use it for
- Active resale inventory count (Layer 2 — New vs. Resale panel)
- Resale absorption rate (Layer 2)
- Resale median price for SFH and Townhome (Layer 2)
- Resale months of supply (Layer 2)

### Coverage
- Nationwide — strong Florida coverage
- Filter by county + year built to get the comparable resale pool

### Access
- Requires Zillow partnership agreement or data licensing
- Public CSV datasets available as a fallback for some metrics

### Important note
> The doc mentions 5 years in section 2.5 but clarifies as 7 years in section 4.5 for the resale age filter. Align on one number before building this integration.

---

## 6. Florida DBPR — Dept. of Business & Professional Regulation

> A supplemental source used specifically to identify and verify licensed builders.

### What you get from it

#### Licensed Contractor & Builder Registry
- Builder / contractor legal business name
- License number and status (active / inactive)
- License type (general contractor, residential contractor, etc.)
- Registered address

### What you use it for
- Verify that a seller/grantor on a deed is a licensed homebuilder (required for subdivision qualification)
- Standardize builder names across MLS and deed records (the same builder may appear under different names in different sources)
- Populate the builder name field for Layer 2 Builder Presence Panel and Layer 3

### Coverage
- Statewide Florida

### Access
- Web search portal (free)
- Downloadable files (free)

---

## 7. Calculated Fields (No External Source)

> These are not pulled from any API — they are computed on your backend from the raw data above.

| Field | Formula | Inputs needed |
|---|---|---|
| Absorption rate | (monthly closed sales / active inventory at month start) × 100 | MLS closed sales + MLS active listings |
| Months of supply | total available inventory / trailing 3-month avg velocity | MLS inventory + MLS sales history |
| Market share (builder) | (builder inventory / total county inventory) × 100 | MLS inventory per builder |
| Price per square foot | closed price / home sqft | MLS closed price + MLS sqft |
| Month-over-month delta | (current month value - previous month value) / previous month value × 100 | Any metric + its prior month value |
| Velocity tier | absorption rate thresholds (e.g. high > 10%, med 5–10%, low < 5%) | Absorption rate |
| Trailing 3-mo avg velocity | sum of last 3 months sales / 3 | MLS sales history |
| Builder avg monthly velocity | sum of builder's last 3 months sales / 3 | MLS sales history filtered by builder |
| Lots remaining | total platted lots - CO count | County Clerk (plat) + Permit portals (CO) |
| Subdivision qualifies? | check all 5 criteria monthly | Clerk plat date + permits + MLS builder activity + CO count |

---

## Summary Table

| Source | Type | Cost | What it feeds |
|---|---|---|---|
| Bridge Interactive API (MLS) | REST API | Commercial (paid) | Layers 1–4: prices, velocity, concessions, inventory, builder names |
| County GIS / ArcGIS | REST API + downloads | Free (public) | Layer 1–2: map boundaries, pins, lot geometry |
| Census TIGER/Line | Bulk download | Free (public) | Layer 1: county boundary polygons |
| County Clerk of Court | Web portals / downloads | Free (public) | Layers 2–3: plat names, total lots, deed validation |
| Local Permit Portals | Web portals / some APIs | Free (public) | Layers 2–3: CO counts, lots remaining, subdivision qualification |
| Zillow API | REST API | Commercial (partnership) | Layer 2 only: resale comparison panel |
| Florida DBPR | Download | Free (public) | Layers 2–3: builder verification and name standardization |
| Calculated fields | Backend logic | N/A | All layers: absorption rate, MoS, market share, deltas, tiers |