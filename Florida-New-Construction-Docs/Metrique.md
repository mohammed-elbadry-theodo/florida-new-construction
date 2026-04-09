## Velocity :(Could be improved)

> The percentage of remaining available inventory (unsold lots or completed-but-unsold homes) that sold during the calendar month.

> Calculated as: (Monthly Closed Sales / Total Available Inventory at Month Start) x 100.
A (Inventory at Month Start) = Q1 + Q2 + Q3
B (Closed Sales)             = Q2

Absorption Rate = (B / A) × 100
#### Query:

> A = Total Available Inventory at Month Start  (denominator)
> Q1 :  Still on market at end of month

> **unsold lots or completed-but-unsold homes** that why i made Active under contract or pending

{{base_url}}/{{dataset_id}}/Property?access_token={{server_token}}
&$filter= PropertyType eq 'Residential' and
    CountyOrParish eq {{county}} and
    ListingContractDate lt 2025-03-01T00:00:00Z and
    (StandardStatus eq 'Active' or StandardStatus eq 'Active Under Contract' or StandardStatus eq 'Pending')
&$top=1
> triky part here : Pending? do we cont it as they are not been yet solded?

> Q2 — Closed DURING the month ← numerator B

{{base_url}}/{{dataset_id}}/Property?access_token={{server_token}}
&$filter=PropertyType eq 'Residential' and
    CountyOrParish eq {{county}} and
    ListingContractDate lt 2025-03-01T00:00:00Z and
    StandardStatus eq 'Closed' and
    CloseDate ne null and 
    CloseDate ge 2025-03-01T00:00:00Z and
    CloseDate le 2025-03-31T23:59:59Z&
&$top=1

> Q3 — Cancelled/Withdrawn/Expired DURING the month

{{base_url}}/{{dataset_id}}/Property?access_token={{server_token}}
&$filter=PropertyType eq 'Residential' and
    CountyOrParish eq {{county}} and
    ListingContractDate lt 2025-03-01T00:00:00Z and
    (StandardStatus eq 'Cancelled' or StandardStatus eq 'Withdrawn' or StandardStatus eq 'Expired') and 
    OffMarketDate ge 2025-03-01T00:00:00Z and
    OffMarketDate le 2025-03-31T23:59:59Z
&$top=1

---

> B =  Monthly Closed Sales.(same as Q2)

{{base_url}}/{{dataset_id}}/Property?access_token={{server_token}}
&$filter=PropertyType eq 'Residential' and
    StandardStatus eq 'Closed' and
    CountyOrParish eq {{county}} and
    CloseDate ne null and
    CloseDate ge {{current_month_start}}T00:00:00Z and
    CloseDate lt 2025-04-01T00:00:00Z
&$select=CloseDate,ContractStatusChangeDate
&$top=1

---
## Median Sales Price
### Query — Closed Sales with Price (SFH)
```
{{base_url}}/{{dataset_id}}/Property
  ?access_token={{server_token}}
  &$filter=PropertyType eq 'Residential' # Townhome => 'Residential Income'
    and CountyOrParish eq '{{county}}'
    and StandardStatus eq 'Closed'
    and CloseDate ge {{current_month_start}}T00:00:00Z
    and CloseDate le {{current_month_end}}T23:59:59Z
    and ClosePrice ne null
  &$select=
    ListingKey,
    ClosePrice, # important
    CloseDate,
    PropertyType,
    PropertySubType,
    CountyOrParish,
    SubdivisionName,
    LivingArea
  &$orderby=ClosePrice asc
  &$top=200
```

> Page 2 → &$top=200 &$skip=200 for the pagination use $ skip
---

> How far back does the MLS data go?
>
> The data typically goes back 20 to 25 years, but your access to older records (like those from 2010) depends entirely on the specific feed permissions granted by your local MLS.

> Absolute Sales Count = just make  {SUBDIVISION_FIELD} eq '{SUBDIVISION_NAME}'
---
## 2.3  Layer 3 — Subdivision Snapshot:

 * SubdivisionName (Existe in the response)
 * BuilderName (Existe in the response)
 * Total Platted Lots : **Need other API**. [https://sampleserver6.arcgisonline.com/arcgis/rest/services](https://sampleserver6.arcgisonline.com/arcgis/rest/services)
 * Lots Remaining : i will use this NewConstructionYN(bool)
 * Current Month Velocity (Absolute)  : Alredy
 * Current Month Velocity (Absorption) : Alredy
 * Median Sales Price — Detached SFH : Alredy
 * Median Sales Price — Townhome : Alredy
 * Price Per Square Foot : &select= ClosePrice/LivingArea
 * Months of Supply = Total Available Inventory / Average Monthly Velocity (last 3 months)
   * 3-month avg = (38 + 42 + 40) / 3 = 40 sales/month
   * Months of Supply = 200 / 40 = 5 months  → undersupplied ✅
   * **Queries Needed** :
   * Q1 — Current Active Inventory : StandardStatus eq 'Active' ✅
   * Q2 — Closed Sales 3 Month ( Month 1 < CloseDate < Month 3) ✅
   * Avg Monthly Sales = Q2 / 3
   * Months of Supply  = Q1 / Avg Monthly Sales
 * Concession Rate: 
   * Concession Rate = (Closings with Concessions / Total Closings This Month) × 100
   * Q1 Total Closings This Month ✅
   * Q2 — Closed sales this month with concessions : ✅
   * **ConcessionsAmount** ne null or **ConcessionsComments** ne null

---
## API Response
By default, the RESO Web API will return 10 listings, regardless of the number of total records available. You may use the $top parameter to specify your request to return up to 200 listings at a time.

If there are more than 200 records available, you will need to paginate through the results.

> If you wish to paginate through more than 10,000 listings you will need to use the dedicated replication endpoint.

All API responses besides metadata are returned in JSON format.