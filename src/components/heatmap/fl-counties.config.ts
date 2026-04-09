// FIPS codes for the 23 target Florida counties
// Source: US Census Bureau TIGER/Line
export const COUNTY_NAME_TO_FIPS: Record<string, string> = {
  Alachua: "12001",
  Baker: "12003",
  Brevard: "12009",
  Citrus: "12017",
  Clay: "12019",
  Duval: "12031",
  Flagler: "12035",
  Hernando: "12053",
  Hillsborough: "12057",
  "Indian River": "12061",
  Lake: "12069",
  Manatee: "12081",
  Marion: "12083",
  Nassau: "12089",
  Orange: "12095",
  Osceola: "12097",
  Pasco: "12101",
  Polk: "12105",
  "St. Johns": "12109",
  "St. Lucie": "12111",
  Seminole: "12117",
  Sumter: "12119",
  Volusia: "12127",
};

export const FIPS_TO_COUNTY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTY_NAME_TO_FIPS).map(([name, fips]) => [fips, name]),
);
