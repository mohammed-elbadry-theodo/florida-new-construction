// Derived from public/data/fl-cousub.geojson so the sidebar can expand counties
// and target the exact subdivision polygon without an extra client fetch.

export interface CountySubdivisionDefinition {
  id: string;
  label: string;
}

export const COUNTY_SUBDIVISIONS: Record<string, CountySubdivisionDefinition[]> = {
  Alachua: [
    { id: "1200191248", label: "Gainesville CCD" },
    { id: "1200191469", label: "Hawthorne CCD" },
    { id: "1200191495", label: "High Springs-Alachua CCD" },
    { id: "1200192184", label: "Micanopy CCD" },
    { id: "1200192314", label: "Newberry-Archer CCD" },
    { id: "1200193536", label: "Waldo CCD" },
  ],
  Baker: [
    { id: "1200392009", label: "Macclenny CCD" },
    { id: "1200393068", label: "Sanderson CCD" },
  ],
  Brevard: [
    { id: "1200990611", label: "Cocoa Beach-Cape Canaveral CCD" },
    { id: "1200990624", label: "Cocoa-Rockledge CCD" },
    { id: "1200991573", label: "Indialantic-Melbourne Beach CCD" },
    { id: "1200992028", label: "Malabar CCD" },
    { id: "1200992106", label: "Melbourne CCD" },
    { id: "1200992119", label: "Melbourne Shores-Floridana Beach CCD" },
    { id: "1200992132", label: "Merritt Island CCD" },
    { id: "1200992587", label: "Palm Bay CCD" },
    { id: "1200993224", label: "Space Center CCD" },
    { id: "1200993419", label: "Titusville CCD" },
    { id: "1200993588", label: "West Brevard CCD" },
  ],
  Citrus: [
    { id: "1201790715", label: "Crystal River CCD" },
    { id: "1201791625", label: "Inverness CCD" },
  ],
  Clay: [
    { id: "1201991300", label: "Green Cove Springs CCD" },
    { id: "1201991742", label: "Keystone Heights CCD" },
    { id: "1201992197", label: "Middleburg-Clay Hill CCD" },
    { id: "1201992509", label: "Orange Park CCD" },
    { id: "1201992678", label: "Penney Farms CCD" },
  ],
  Duval: [
    { id: "1203190110", label: "Baldwin CCD" },
    { id: "1203191640", label: "Jacksonville Beaches CCD" },
    { id: "1203191642", label: "Jacksonville East CCD" },
    { id: "1203191644", label: "Jacksonville North CCD" },
    { id: "1203191646", label: "Jacksonville West CCD" },
  ],
  Flagler: [
    { id: "1203590338", label: "Bunnell CCD" },
    { id: "1203591092", label: "Flagler Beach CCD" },
  ],
  Hernando: [
    { id: "1205390325", label: "Brooksville CCD" },
    { id: "1205391475", label: "Hernando Beach CCD" },
    { id: "1205392964", label: "Ridge Manor CCD" },
    { id: "1205393230", label: "Spring Hill CCD" },
  ],
  Hillsborough: [
    { id: "1205790286", label: "Brandon CCD" },
    { id: "1205791735", label: "Keystone-Citrus Park CCD" },
    { id: "1205792614", label: "Palm River-Gibsonton CCD" },
    { id: "1205792769", label: "Plant City CCD" },
    { id: "1205793003", label: "Ruskin CCD" },
    { id: "1205793367", label: "Tampa CCD" },
    { id: "1205793693", label: "Wimauma-Riverview CCD" },
  ],
  "Indian River": [
    { id: "1206191066", label: "Fellsmere CCD" },
    { id: "1206193510", label: "Vero Beach CCD" },
  ],
  Lake: [
    { id: "1206990585", label: "Clermont CCD" },
    { id: "1206991014", label: "Eustis CCD" },
    { id: "1206991235", label: "Fruitland Park-Lady Lake CCD" },
    { id: "1206991365", label: "Groveland-Mascotte CCD" },
    { id: "1206991541", label: "Howey-in-the-Hills-Okahumpka CCD" },
    { id: "1206991911", label: "Leesburg CCD" },
    { id: "1206991924", label: "Leesburg East CCD" },
    { id: "1206992262", label: "Mount Dora CCD" },
    { id: "1206993393", label: "Tavares CCD" },
    { id: "1206993445", label: "Umatilla CCD" },
  ],
  Manatee: [
    { id: "1208190273", label: "Bradenton CCD" },
    { id: "1208192290", label: "Myakka City CCD" },
    { id: "1208192600", label: "Palmetto CCD" },
    { id: "1208192652", label: "Parrish CCD" },
  ],
  Marion: [
    { id: "1208390156", label: "Belleview CCD" },
    { id: "1208390871", label: "Dunnellon CCD" },
    { id: "1208390897", label: "East Marion CCD" },
    { id: "1208391053", label: "Fellowship CCD" },
    { id: "1208391105", label: "Fort McCoy-Anthony CCD" },
    { id: "1208392483", label: "Ocala CCD" },
    { id: "1208392951", label: "Reddick-McIntosh CCD" },
  ],
  Nassau: [
    { id: "1208990364", label: "Callahan-Hilliard CCD" },
    { id: "1208991079", label: "Fernandina Beach CCD" },
    { id: "1208993757", label: "Yulee CCD" },
  ],
  Orange: [
    { id: "1209590052", label: "Apopka CCD" },
    { id: "1209590910", label: "East Orange CCD" },
    { id: "1209592522", label: "Orlando CCD" },
    { id: "1209593198", label: "Southwest Orange CCD" },
    { id: "1209593458", label: "Union Park CCD" },
    { id: "1209593705", label: "Winter Garden-Ocoee CCD" },
  ],
  Osceola: [
    { id: "1209791768", label: "Kissimmee CCD" },
    { id: "1209793146", label: "South and East Osceola CCD" },
    { id: "1209793029", label: "St. Cloud CCD" },
  ],
  Pasco: [
    { id: "1210190481", label: "Central Pasco CCD" },
    { id: "1210190741", label: "Dade City CCD" },
    { id: "1210191794", label: "Lacoochee CCD" },
    { id: "1210192327", label: "New Port Richey CCD" },
    { id: "1210192860", label: "Port Richey CCD" },
    { id: "1210193770", label: "Zephyrhills CCD" },
  ],
  Polk: [
    { id: "1210590117", label: "Bartow CCD" },
    { id: "1210591209", label: "Frostproof CCD" },
    { id: "1210591404", label: "Haines City CCD" },
    { id: "1210591859", label: "Lake Wales CCD" },
    { id: "1210591833", label: "Lakeland CCD" },
    { id: "1210593718", label: "Winter Haven-Auburndale CCD" },
  ],
  Seminole: [
    { id: "1211790455", label: "Casselberry-Altamonte Springs CCD" },
    { id: "1211792548", label: "Oviedo CCD" },
    { id: "1211793081", label: "Sanford CCD" },
  ],
  "St. Johns": [
    { id: "1210991222", label: "Fruit Cove CCD" },
    { id: "1210991443", label: "Hastings CCD" },
    { id: "1210992080", label: "Matanzas CCD" },
    { id: "1210992795", label: "Ponte Vedra CCD" },
    { id: "1210993016", label: "St. Augustine CCD" },
  ],
  "St. Lucie": [
    { id: "1211191157", label: "Fort Pierce CCD" },
    { id: "1211191547", label: "Hutchinson Island CCD" },
    { id: "1211192866", label: "Port St. Lucie CCD" },
    { id: "1211193620", label: "West St. Lucie CCD" },
  ],
  Sumter: [
    { id: "1211990344", label: "Bushnell-Center Hill CCD" },
    { id: "1211993666", label: "Wildwood CCD" },
  ],
  Volusia: [
    { id: "1212790494", label: "Central Volusia CCD" },
    { id: "1212790780", label: "Daytona Beach CCD" },
    { id: "1212790793", label: "DeBary-Orange City CCD" },
    { id: "1212790832", label: "DeLand CCD" },
    { id: "1212790845", label: "Deltona CCD" },
    { id: "1212792340", label: "New Smyrna Beach CCD" },
    { id: "1212792418", label: "North Peninsula CCD" },
    { id: "1212792535", label: "Ormond Beach CCD" },
    { id: "1212792730", label: "Pierson-Seville CCD" },
    { id: "1212792847", label: "Port Orange CCD" },
    { id: "1212793159", label: "South Peninsula CCD" },
  ],
};

export const COUNTY_SUBDIVISION_NAMES = Object.fromEntries(
  Object.entries(COUNTY_SUBDIVISIONS).map(([county, subdivisions]) => [
    county,
    subdivisions.map((subdivision) => subdivision.label),
  ]),
) as Record<string, string[]>;
