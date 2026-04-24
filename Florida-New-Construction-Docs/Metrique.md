# Metrics & Bridge API Queries

## 1. Sales Velocity (Absorption Rate)

> % of available inventory that sold during the calendar month.

**Formula**

```
Absorption Rate = (B / A) × 100

A = Inventory at Month Start = Q1 + Q2 + Q3
B = Closed Sales During Month = Q2
```

### Q1 — Still on market at end of month

Active, Active Under Contract, or Pending listings (unsold lots / completed-but-unsold homes).

> ⚠️ Open question: should **Pending** count as sold or unsold?

```http
GET {{base_url}}/{{dataset_id}}/Property
  ?access_token={{server_token}}
  &$filter=PropertyType eq 'Residential'
    and CountyOrParish eq '{{county}}'
    and ListingContractDate lt 2025-03-01T00:00:00Z
    and (StandardStatus eq 'Active'
      or StandardStatus eq 'Active Under Contract'
      or StandardStatus eq 'Pending')
  &$top=1
```

### Q2 — Closed during the month (numerator B)

```http
GET {{base_url}}/{{dataset_id}}/Property
  ?access_token={{server_token}}
  &$filter=PropertyType eq 'Residential'
    and CountyOrParish eq '{{county}}'
    and StandardStatus eq 'Closed'
    and CloseDate ne null
    and CloseDate ge 2025-03-01T00:00:00Z
    and CloseDate le 2025-03-31T23:59:59Z
  &$top=1
```

### Q3 — Cancelled / Withdrawn / Expired during the month

```http
GET {{base_url}}/{{dataset_id}}/Property
  ?access_token={{server_token}}
  &$filter=PropertyType eq 'Residential'
    and CountyOrParish eq '{{county}}'
    and ListingContractDate lt 2025-03-01T00:00:00Z
    and (StandardStatus eq 'Cancelled'
      or StandardStatus eq 'Withdrawn'
      or StandardStatus eq 'Expired')
    and OffMarketDate ge 2025-03-01T00:00:00Z
    and OffMarketDate le 2025-03-31T23:59:59Z
  &$top=1
```

---

## 2. Median Sales Price

Closed sales with non-null `ClosePrice` for the month. Switch `PropertyType` to filter SFH vs. Townhome.

- **SFH** → `PropertyType eq 'Residential'`
- **Townhome** → `PropertyType eq 'Residential Income'`

```http
GET {{base_url}}/{{dataset_id}}/Property
  ?access_token={{server_token}}
  &$filter=PropertyType eq 'Residential'
    and CountyOrParish eq '{{county}}'
    and StandardStatus eq 'Closed'
    and CloseDate ge {{current_month_start}}T00:00:00Z
    and CloseDate le {{current_month_end}}T23:59:59Z
    and ClosePrice ne null
  &$select=ListingKey,ClosePrice,CloseDate,PropertyType,PropertySubType,CountyOrParish,SubdivisionName,LivingArea
  &$orderby=ClosePrice asc
  &$top=200
```

**Pagination:** `$top=200&$skip=200` for page 2, etc.

> MLS data typically goes back 20–25 years; older-record access depends on local MLS feed permissions.

---

## 3. Layer 2 — Builders & Subdivisions

- **All builder names:** `GET /{dataset}/Property?$top=10&$select=BuilderName`
- **By county:** `$filter=CountyOrParish eq 'Orange'&$select=BuilderName,CountyOrParish,SubdivisionName`
- **By subdivision:** `$filter=SubdivisionName eq 'Storey Park'&$select=BuilderName,SubdivisionName`

Bridge returns builder lists scoped to any county or subdivision.

---

## 4. Layer 3 — Subdivision Snapshot

| Field                          | Source                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| SubdivisionName                | ✅ In response                                                         |
| BuilderName                    | ✅ In response                                                         |
| Total Platted Lots             | ❌ Needs external API (e.g. ArcGIS parcel service)                     |
| Lots Remaining                 | `NewConstructionYN eq true`                                            |
| Current Month Velocity (abs.)  | ✅ See §1                                                              |
| Current Month Velocity (rate)  | ✅ See §1                                                              |
| Median Price — SFH / Townhome  | ✅ See §2                                                              |
| Price per Sq Ft                | `ClosePrice / LivingArea`                                              |
| Months of Supply               | See below                                                              |
| Concession Rate                | See below                                                              |

### Months of Supply

```
Months of Supply = Active Inventory / Avg Monthly Sales (last 3 months)
```

Example: inventory 200, 3-month avg 40 → 200 / 40 = **5 months** (undersupplied).

Queries: Q1 current active inventory, Q2 closed sales over last 3 months, then `Q1 / (Q2 / 3)`.

### Concession Rate

```
Concession Rate = (Closings with Concessions / Total Closings) × 100
```

Flag concessions via `ConcessionsAmount ne null` or `ConcessionsComments ne null`.

---

## API Notes

- Default page size: **10**. Use `$top` up to **200**.
- For > 200 results: paginate with `$skip`.
- For > 10,000 results: use the dedicated replication endpoint.
- All responses (except metadata) are JSON.
