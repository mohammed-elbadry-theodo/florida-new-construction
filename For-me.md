- Build a store locator using Mapbox GL JS : this one good for the list of the counties

---

## try them if not worked

https://visgl.github.io/react-map-gl/examples

---

- the county namber is it fixed or they could be added more county?

---

❯ - Selected county highlighted with white border + 48% fill

- Other 22 counties still visible (dimmed at 40%)
  -> i want the opostie the selected one to be at 35% of opacity
  -> and the other counties to 60%

-> Subdivision pins appear inside the county, color-coded by velocity tier
(i can't see all the pins inside the counties and also they are not clickble to get informations about that subdivision i want in the right side wehn i select a specifique it shows those metrique of that subdivision that are mentioned in the doc i want them for now just mock i dont want concreis data just mock all the data if you dont have them)

---

- to select the Builder name:
  > GET /{dataset}/Property?$top=10&$select=BuilderName
- For exact county:
  > GET /api/v2/OData/{dataset}/Property?$filter=CountyOrParish eq 'Orange'&$select=BuilderName,CountyOrParish,SubdivisionName&
- For exact subdivision:
  > GET /api/v2/OData/{dataset}/Property?$filter=SubdivisionName eq 'Storey Park'&$select=BuilderName,SubdivisionName
