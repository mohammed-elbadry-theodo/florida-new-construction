import type { HomeType, SubdivisionPin, VelocityTier } from "~components/heatmap/types";

function tier(rate: number): VelocityTier {
  if (rate >= 10) return "high";
  if (rate >= 5) return "medium";
  return "low";
}

function slug(county: string, name: string): string {
  return `${county}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

type RawPin = Omit<SubdivisionPin, "id" | "velocityTier" | "homeType">;

// ─── SFH mock subdivisions — coordinates verified inside each county bbox ─────
const SFH_PINS: RawPin[] = [
  // ── Orange ──────────────────────────────────────────────────────────────────
  { name: "Laureate Park", county: "Orange", builder: "Tavistock Development", lng: -81.31, lat: 28.38, absorptionRate: 15.2, absorptionRatePrevMonth: 13.8, medianClosePrice: 480000, medianClosePricePrevMonth: 470000, activeInventory: 62, closedSalesThisMonth: 11, totalPlatLots: 4500, lotsRemaining: 1200 },
  { name: "Horizon West", county: "Orange", builder: "Meritage Homes", lng: -81.55, lat: 28.47, absorptionRate: 13.4, absorptionRatePrevMonth: 12.1, medianClosePrice: 455000, medianClosePricePrevMonth: 445000, activeInventory: 89, closedSalesThisMonth: 14, totalPlatLots: 3200, lotsRemaining: 860 },
  { name: "Storey Park", county: "Orange", builder: "Lennar", lng: -81.27, lat: 28.40, absorptionRate: 12.1, absorptionRatePrevMonth: 11.4, medianClosePrice: 441000, medianClosePricePrevMonth: 433000, activeInventory: 54, closedSalesThisMonth: 8, totalPlatLots: 1800, lotsRemaining: 420 },
  { name: "Avalon Park West", county: "Orange", builder: "D.R. Horton", lng: -81.17, lat: 28.47, absorptionRate: 11.8, absorptionRatePrevMonth: 10.9, medianClosePrice: 418000, medianClosePricePrevMonth: 410000, activeInventory: 47, closedSalesThisMonth: 7, totalPlatLots: 1400, lotsRemaining: 310 },
  { name: "Sunbridge", county: "Orange", builder: "Toll Brothers", lng: -81.14, lat: 28.42, absorptionRate: 14.5, absorptionRatePrevMonth: 13.2, medianClosePrice: 512000, medianClosePricePrevMonth: 499000, activeInventory: 38, closedSalesThisMonth: 7, totalPlatLots: 2200, lotsRemaining: 1800 },
  // ── Hillsborough ─────────────────────────────────────────────────────────────
  { name: "FishHawk Ranch West", county: "Hillsborough", builder: "Homes by WestBay", lng: -82.23, lat: 27.77, absorptionRate: 16.1, absorptionRatePrevMonth: 14.8, medianClosePrice: 445000, medianClosePricePrevMonth: 436000, activeInventory: 71, closedSalesThisMonth: 14, totalPlatLots: 2800, lotsRemaining: 650 },
  { name: "Triple Creek", county: "Hillsborough", builder: "Lennar", lng: -82.29, lat: 27.73, absorptionRate: 14.3, absorptionRatePrevMonth: 13.1, medianClosePrice: 398000, medianClosePricePrevMonth: 389000, activeInventory: 93, closedSalesThisMonth: 16, totalPlatLots: 3600, lotsRemaining: 980 },
  { name: "Waterset", county: "Hillsborough", builder: "D.R. Horton", lng: -82.37, lat: 27.74, absorptionRate: 13.7, absorptionRatePrevMonth: 12.6, medianClosePrice: 412000, medianClosePricePrevMonth: 404000, activeInventory: 58, closedSalesThisMonth: 9, totalPlatLots: 2100, lotsRemaining: 430 },
  { name: "Southshore Bay", county: "Hillsborough", builder: "Metro Development Group", lng: -82.44, lat: 27.72, absorptionRate: 12.8, absorptionRatePrevMonth: 11.9, medianClosePrice: 375000, medianClosePricePrevMonth: 367000, activeInventory: 82, closedSalesThisMonth: 12, totalPlatLots: 4000, lotsRemaining: 2800 },
  { name: "K-Bar Ranch", county: "Hillsborough", builder: "Pulte Homes", lng: -82.28, lat: 28.09, absorptionRate: 11.4, absorptionRatePrevMonth: 10.7, medianClosePrice: 428000, medianClosePricePrevMonth: 420000, activeInventory: 44, closedSalesThisMonth: 6, totalPlatLots: 1200, lotsRemaining: 180 },
  // ── St. Johns ────────────────────────────────────────────────────────────────
  { name: "Shearwater", county: "St. Johns", builder: "Dream Finders Homes", lng: -81.57, lat: 30.04, absorptionRate: 17.3, absorptionRatePrevMonth: 15.9, medianClosePrice: 528000, medianClosePricePrevMonth: 514000, activeInventory: 58, closedSalesThisMonth: 12, totalPlatLots: 2800, lotsRemaining: 640 },
  { name: "RiverTown", county: "St. Johns", builder: "St. Joe Company", lng: -81.59, lat: 30.07, absorptionRate: 15.8, absorptionRatePrevMonth: 14.2, medianClosePrice: 511000, medianClosePricePrevMonth: 499000, activeInventory: 74, closedSalesThisMonth: 14, totalPlatLots: 4000, lotsRemaining: 2100 },
  { name: "Beachwalk", county: "St. Johns", builder: "ICI Homes", lng: -81.57, lat: 29.93, absorptionRate: 14.2, absorptionRatePrevMonth: 13.0, medianClosePrice: 492000, medianClosePricePrevMonth: 480000, activeInventory: 49, closedSalesThisMonth: 8, totalPlatLots: 1600, lotsRemaining: 390 },
  { name: "Beacon Lake", county: "St. Johns", builder: "Mattamy Homes", lng: -81.56, lat: 30.01, absorptionRate: 13.6, absorptionRatePrevMonth: 12.5, medianClosePrice: 478000, medianClosePricePrevMonth: 467000, activeInventory: 63, closedSalesThisMonth: 10, totalPlatLots: 2200, lotsRemaining: 1400 },
  { name: "Greenpointe at Nocatee", county: "St. Johns", builder: "Ponte Vedra Corporation", lng: -81.41, lat: 30.09, absorptionRate: 16.4, absorptionRatePrevMonth: 14.8, medianClosePrice: 545000, medianClosePricePrevMonth: 531000, activeInventory: 41, closedSalesThisMonth: 8, totalPlatLots: 1100, lotsRemaining: 220 },
  // ── Pasco ────────────────────────────────────────────────────────────────────
  { name: "Epperson", county: "Pasco", builder: "Metro Development Group", lng: -82.36, lat: 28.27, absorptionRate: 14.8, absorptionRatePrevMonth: 13.5, medianClosePrice: 368000, medianClosePricePrevMonth: 359000, activeInventory: 142, closedSalesThisMonth: 25, totalPlatLots: 5000, lotsRemaining: 3200 },
  { name: "Mirada", county: "Pasco", builder: "Lennar", lng: -82.40, lat: 28.29, absorptionRate: 13.2, absorptionRatePrevMonth: 12.1, medianClosePrice: 352000, medianClosePricePrevMonth: 344000, activeInventory: 118, closedSalesThisMonth: 18, totalPlatLots: 3800, lotsRemaining: 1900 },
  { name: "Connerton", county: "Pasco", builder: "D.R. Horton", lng: -82.43, lat: 28.38, absorptionRate: 11.7, absorptionRatePrevMonth: 10.9, medianClosePrice: 341000, medianClosePricePrevMonth: 334000, activeInventory: 96, closedSalesThisMonth: 13, totalPlatLots: 2800, lotsRemaining: 740 },
  { name: "Angeline", county: "Pasco", builder: "Mattamy Homes", lng: -82.55, lat: 28.38, absorptionRate: 12.4, absorptionRatePrevMonth: 11.2, medianClosePrice: 358000, medianClosePricePrevMonth: 350000, activeInventory: 88, closedSalesThisMonth: 13, totalPlatLots: 6000, lotsRemaining: 5600 },
  // ── Polk ─────────────────────────────────────────────────────────────────────
  { name: "Bridgewater at Lake Alfred", county: "Polk", builder: "D.R. Horton", lng: -81.73, lat: 28.10, absorptionRate: 13.6, absorptionRatePrevMonth: 12.4, medianClosePrice: 329000, medianClosePricePrevMonth: 322000, activeInventory: 104, closedSalesThisMonth: 17, totalPlatLots: 2400, lotsRemaining: 860 },
  { name: "Hammock Reserve", county: "Polk", builder: "Meritage Homes", lng: -81.57, lat: 28.02, absorptionRate: 12.1, absorptionRatePrevMonth: 11.4, medianClosePrice: 342000, medianClosePricePrevMonth: 335000, activeInventory: 86, closedSalesThisMonth: 12, totalPlatLots: 1800, lotsRemaining: 560 },
  { name: "Highland Meadows", county: "Polk", builder: "Lennar", lng: -81.52, lat: 27.93, absorptionRate: 11.4, absorptionRatePrevMonth: 10.6, medianClosePrice: 315000, medianClosePricePrevMonth: 308000, activeInventory: 123, closedSalesThisMonth: 16, totalPlatLots: 3200, lotsRemaining: 1100 },
  { name: "Seasons at Miramar Lakes", county: "Polk", builder: "K. Hovnanian Homes", lng: -81.82, lat: 27.96, absorptionRate: 10.8, absorptionRatePrevMonth: 9.9, medianClosePrice: 328000, medianClosePricePrevMonth: 321000, activeInventory: 67, closedSalesThisMonth: 8, totalPlatLots: 1400, lotsRemaining: 480 },
  // ── Duval ────────────────────────────────────────────────────────────────────
  { name: "Tributary", county: "Duval", builder: "Lennar", lng: -81.85, lat: 30.45, absorptionRate: 14.2, absorptionRatePrevMonth: 13.0, medianClosePrice: 378000, medianClosePricePrevMonth: 370000, activeInventory: 98, closedSalesThisMonth: 16, totalPlatLots: 3000, lotsRemaining: 2100 },
  { name: "Pablo Cove", county: "Duval", builder: "D.R. Horton", lng: -81.47, lat: 30.29, absorptionRate: 12.8, absorptionRatePrevMonth: 11.7, medianClosePrice: 392000, medianClosePricePrevMonth: 383000, activeInventory: 74, closedSalesThisMonth: 11, totalPlatLots: 1600, lotsRemaining: 480 },
  { name: "Bartram Park Reserve", county: "Duval", builder: "Toll Brothers", lng: -81.51, lat: 30.18, absorptionRate: 11.6, absorptionRatePrevMonth: 10.8, medianClosePrice: 418000, medianClosePricePrevMonth: 409000, activeInventory: 52, closedSalesThisMonth: 7, totalPlatLots: 1200, lotsRemaining: 290 },
  { name: "Oakleaf Plantation", county: "Duval", builder: "Pulte Homes", lng: -81.87, lat: 30.19, absorptionRate: 10.4, absorptionRatePrevMonth: 9.7, medianClosePrice: 356000, medianClosePricePrevMonth: 349000, activeInventory: 88, closedSalesThisMonth: 10, totalPlatLots: 4800, lotsRemaining: 620 },
  // ── Osceola ──────────────────────────────────────────────────────────────────
  { name: "Tapestry", county: "Osceola", builder: "Lennar", lng: -81.41, lat: 28.16, absorptionRate: 12.4, absorptionRatePrevMonth: 11.3, medianClosePrice: 385000, medianClosePricePrevMonth: 377000, activeInventory: 78, closedSalesThisMonth: 11, totalPlatLots: 2200, lotsRemaining: 980 },
  { name: "Sunstone at Astonia", county: "Osceola", builder: "D.R. Horton", lng: -81.53, lat: 27.80, absorptionRate: 10.9, absorptionRatePrevMonth: 10.1, medianClosePrice: 368000, medianClosePricePrevMonth: 360000, activeInventory: 64, closedSalesThisMonth: 8, totalPlatLots: 1800, lotsRemaining: 1200 },
  { name: "Kindred", county: "Osceola", builder: "Pulte Homes", lng: -81.35, lat: 28.14, absorptionRate: 9.8, absorptionRatePrevMonth: 9.1, medianClosePrice: 372000, medianClosePricePrevMonth: 364000, activeInventory: 56, closedSalesThisMonth: 6, totalPlatLots: 1600, lotsRemaining: 740 },
  // ── Lake ─────────────────────────────────────────────────────────────────────
  { name: "Sawgrass Bay", county: "Lake", builder: "D.R. Horton", lng: -81.59, lat: 28.51, absorptionRate: 12.3, absorptionRatePrevMonth: 11.2, medianClosePrice: 388000, medianClosePricePrevMonth: 380000, activeInventory: 92, closedSalesThisMonth: 13, totalPlatLots: 2600, lotsRemaining: 1100 },
  { name: "Wellness Ridge", county: "Lake", builder: "Lennar", lng: -81.71, lat: 28.61, absorptionRate: 10.7, absorptionRatePrevMonth: 9.8, medianClosePrice: 374000, medianClosePricePrevMonth: 366000, activeInventory: 74, closedSalesThisMonth: 9, totalPlatLots: 1900, lotsRemaining: 1400 },
  { name: "Promenade at Lake Park", county: "Lake", builder: "Mattamy Homes", lng: -81.80, lat: 28.78, absorptionRate: 9.4, absorptionRatePrevMonth: 8.8, medianClosePrice: 362000, medianClosePricePrevMonth: 355000, activeInventory: 58, closedSalesThisMonth: 6, totalPlatLots: 1400, lotsRemaining: 620 },
  // ── Manatee ──────────────────────────────────────────────────────────────────
  { name: "Solera at Lakewood Ranch", county: "Manatee", builder: "D.R. Horton", lng: -82.39, lat: 27.43, absorptionRate: 12.8, absorptionRatePrevMonth: 11.6, medianClosePrice: 478000, medianClosePricePrevMonth: 468000, activeInventory: 68, closedSalesThisMonth: 10, totalPlatLots: 2000, lotsRemaining: 1400 },
  { name: "Cresswind Lakewood Ranch", county: "Manatee", builder: "Kolter Homes", lng: -82.35, lat: 27.51, absorptionRate: 11.4, absorptionRatePrevMonth: 10.5, medianClosePrice: 512000, medianClosePricePrevMonth: 500000, activeInventory: 44, closedSalesThisMonth: 6, totalPlatLots: 1000, lotsRemaining: 320 },
  { name: "Sweetwater at Lakewood Ranch", county: "Manatee", builder: "Neal Communities", lng: -82.31, lat: 27.47, absorptionRate: 10.2, absorptionRatePrevMonth: 9.4, medianClosePrice: 491000, medianClosePricePrevMonth: 481000, activeInventory: 52, closedSalesThisMonth: 6, totalPlatLots: 1200, lotsRemaining: 580 },
  // ── Brevard ──────────────────────────────────────────────────────────────────
  { name: "Viera East", county: "Brevard", builder: "Viera Builders", lng: -80.72, lat: 28.28, absorptionRate: 10.6, absorptionRatePrevMonth: 9.8, medianClosePrice: 368000, medianClosePricePrevMonth: 360000, activeInventory: 86, closedSalesThisMonth: 10, totalPlatLots: 3200, lotsRemaining: 820 },
  { name: "Hammock Lakes at Cape Canaveral", county: "Brevard", builder: "D.R. Horton", lng: -80.71, lat: 28.39, absorptionRate: 9.1, absorptionRatePrevMonth: 8.5, medianClosePrice: 348000, medianClosePricePrevMonth: 341000, activeInventory: 64, closedSalesThisMonth: 6, totalPlatLots: 1400, lotsRemaining: 560 },
  { name: "Heritage Isle", county: "Brevard", builder: "Engle Homes", lng: -80.72, lat: 28.18, absorptionRate: 8.4, absorptionRatePrevMonth: 7.9, medianClosePrice: 359000, medianClosePricePrevMonth: 352000, activeInventory: 48, closedSalesThisMonth: 4, totalPlatLots: 1100, lotsRemaining: 180 },
  // ── Volusia ──────────────────────────────────────────────────────────────────
  { name: "LPGA International", county: "Volusia", builder: "Paytas Homes", lng: -81.11, lat: 29.15, absorptionRate: 9.2, absorptionRatePrevMonth: 8.6, medianClosePrice: 352000, medianClosePricePrevMonth: 345000, activeInventory: 72, closedSalesThisMonth: 7, totalPlatLots: 2800, lotsRemaining: 920 },
  { name: "Preserve at Deltona", county: "Volusia", builder: "D.R. Horton", lng: -81.21, lat: 28.90, absorptionRate: 8.1, absorptionRatePrevMonth: 7.6, medianClosePrice: 329000, medianClosePricePrevMonth: 322000, activeInventory: 88, closedSalesThisMonth: 8, totalPlatLots: 2200, lotsRemaining: 760 },
  { name: "Margaritaville Daytona Beach", county: "Volusia", builder: "Minto Communities", lng: -81.16, lat: 29.19, absorptionRate: 7.4, absorptionRatePrevMonth: 7.0, medianClosePrice: 362000, medianClosePricePrevMonth: 356000, activeInventory: 58, closedSalesThisMonth: 5, totalPlatLots: 7000, lotsRemaining: 5800 },
  // ── Seminole ─────────────────────────────────────────────────────────────────
  { name: "Preserve at Lake Monroe", county: "Seminole", builder: "Pulte Homes", lng: -81.33, lat: 28.83, absorptionRate: 10.8, absorptionRatePrevMonth: 10.0, medianClosePrice: 459000, medianClosePricePrevMonth: 449000, activeInventory: 48, closedSalesThisMonth: 6, totalPlatLots: 960, lotsRemaining: 240 },
  { name: "Markham Glen", county: "Seminole", builder: "Meritage Homes", lng: -81.39, lat: 28.71, absorptionRate: 9.4, absorptionRatePrevMonth: 8.8, medianClosePrice: 471000, medianClosePricePrevMonth: 461000, activeInventory: 36, closedSalesThisMonth: 4, totalPlatLots: 720, lotsRemaining: 160 },
  { name: "Seasons at Preserve at Black Bear", county: "Seminole", builder: "K. Hovnanian Homes", lng: -81.41, lat: 28.65, absorptionRate: 8.8, absorptionRatePrevMonth: 8.3, medianClosePrice: 448000, medianClosePricePrevMonth: 439000, activeInventory: 42, closedSalesThisMonth: 4, totalPlatLots: 840, lotsRemaining: 220 },
  // ── Clay ─────────────────────────────────────────────────────────────────────
  { name: "Oakleaf Commons", county: "Clay", builder: "D.R. Horton", lng: -81.82, lat: 30.15, absorptionRate: 13.4, absorptionRatePrevMonth: 12.2, medianClosePrice: 372000, medianClosePricePrevMonth: 364000, activeInventory: 82, closedSalesThisMonth: 13, totalPlatLots: 2400, lotsRemaining: 920 },
  { name: "Argyle Forest", county: "Clay", builder: "Lennar", lng: -81.79, lat: 30.22, absorptionRate: 11.8, absorptionRatePrevMonth: 10.9, medianClosePrice: 384000, medianClosePricePrevMonth: 375000, activeInventory: 64, closedSalesThisMonth: 9, totalPlatLots: 1800, lotsRemaining: 480 },
  { name: "Eagle Landing", county: "Clay", builder: "Pulte Homes", lng: -81.78, lat: 29.96, absorptionRate: 10.6, absorptionRatePrevMonth: 9.8, medianClosePrice: 396000, medianClosePricePrevMonth: 387000, activeInventory: 48, closedSalesThisMonth: 6, totalPlatLots: 1100, lotsRemaining: 260 },
  // ── St. Lucie ────────────────────────────────────────────────────────────────
  { name: "Tradition", county: "St. Lucie", builder: "Mattamy Homes", lng: -80.45, lat: 27.33, absorptionRate: 11.2, absorptionRatePrevMonth: 10.3, medianClosePrice: 375000, medianClosePricePrevMonth: 367000, activeInventory: 96, closedSalesThisMonth: 12, totalPlatLots: 8000, lotsRemaining: 5400 },
  { name: "LakePark at Tradition", county: "St. Lucie", builder: "GL Homes", lng: -80.42, lat: 27.35, absorptionRate: 9.8, absorptionRatePrevMonth: 9.1, medianClosePrice: 392000, medianClosePricePrevMonth: 383000, activeInventory: 58, closedSalesThisMonth: 6, totalPlatLots: 1400, lotsRemaining: 360 },
  { name: "Telaro at Tradition", county: "St. Lucie", builder: "Minto Communities", lng: -80.46, lat: 27.36, absorptionRate: 8.4, absorptionRatePrevMonth: 7.9, medianClosePrice: 368000, medianClosePricePrevMonth: 360000, activeInventory: 72, closedSalesThisMonth: 6, totalPlatLots: 3200, lotsRemaining: 2800 },
  // ── Flagler ──────────────────────────────────────────────────────────────────
  { name: "Grand Landings", county: "Flagler", builder: "D.R. Horton", lng: -81.32, lat: 29.48, absorptionRate: 10.2, absorptionRatePrevMonth: 9.4, medianClosePrice: 376000, medianClosePricePrevMonth: 368000, activeInventory: 78, closedSalesThisMonth: 9, totalPlatLots: 2000, lotsRemaining: 1100 },
  { name: "Palm Coast Park", county: "Flagler", builder: "Landsea Homes", lng: -81.28, lat: 29.56, absorptionRate: 8.6, absorptionRatePrevMonth: 8.0, medianClosePrice: 361000, medianClosePricePrevMonth: 354000, activeInventory: 54, closedSalesThisMonth: 5, totalPlatLots: 1600, lotsRemaining: 1100 },
  // ── Indian River ─────────────────────────────────────────────────────────────
  { name: "Pointe West", county: "Indian River", builder: "Lennar", lng: -80.57, lat: 27.72, absorptionRate: 8.4, absorptionRatePrevMonth: 7.8, medianClosePrice: 418000, medianClosePricePrevMonth: 410000, activeInventory: 62, closedSalesThisMonth: 6, totalPlatLots: 1800, lotsRemaining: 640 },
  { name: "Waterway Village", county: "Indian River", builder: "GHO Homes", lng: -80.55, lat: 27.65, absorptionRate: 6.8, absorptionRatePrevMonth: 6.2, medianClosePrice: 432000, medianClosePricePrevMonth: 424000, activeInventory: 44, closedSalesThisMonth: 3, totalPlatLots: 880, lotsRemaining: 220 },
  // ── Hernando ─────────────────────────────────────────────────────────────────
  { name: "Trilby Crossing", county: "Hernando", builder: "D.R. Horton", lng: -82.33, lat: 28.50, absorptionRate: 10.1, absorptionRatePrevMonth: 9.3, medianClosePrice: 318000, medianClosePricePrevMonth: 311000, activeInventory: 88, closedSalesThisMonth: 10, totalPlatLots: 2200, lotsRemaining: 1600 },
  { name: "Spring Hill Ranch", county: "Hernando", builder: "Lennar", lng: -82.47, lat: 28.48, absorptionRate: 8.2, absorptionRatePrevMonth: 7.7, medianClosePrice: 304000, medianClosePricePrevMonth: 298000, activeInventory: 64, closedSalesThisMonth: 6, totalPlatLots: 1400, lotsRemaining: 540 },
  // ── Marion ────────────────────────────────────────────────────────────────────
  { name: "On Top of the World", county: "Marion", builder: "On Top of the World Communities", lng: -82.21, lat: 29.12, absorptionRate: 8.4, absorptionRatePrevMonth: 7.8, medianClosePrice: 289000, medianClosePricePrevMonth: 283000, activeInventory: 112, closedSalesThisMonth: 11, totalPlatLots: 12000, lotsRemaining: 3400 },
  { name: "Stone Creek by Del Webb", county: "Marion", builder: "Pulte Homes", lng: -82.27, lat: 29.21, absorptionRate: 7.2, absorptionRatePrevMonth: 6.7, medianClosePrice: 304000, medianClosePricePrevMonth: 298000, activeInventory: 76, closedSalesThisMonth: 6, totalPlatLots: 4600, lotsRemaining: 820 },
  { name: "Ocala Preserve", county: "Marion", builder: "Shea Homes", lng: -82.13, lat: 29.19, absorptionRate: 6.8, absorptionRatePrevMonth: 6.3, medianClosePrice: 312000, medianClosePricePrevMonth: 305000, activeInventory: 58, closedSalesThisMonth: 4, totalPlatLots: 2800, lotsRemaining: 1200 },
  // ── Sumter ────────────────────────────────────────────────────────────────────
  { name: "The Villages — Fenney", county: "Sumter", builder: "The Villages Developer", lng: -82.07, lat: 28.65, absorptionRate: 8.6, absorptionRatePrevMonth: 8.9, medianClosePrice: 312000, medianClosePricePrevMonth: 315000, activeInventory: 94, closedSalesThisMonth: 9, totalPlatLots: 6000, lotsRemaining: 2800 },
  { name: "Del Webb Sunbridge", county: "Sumter", builder: "Pulte Homes", lng: -81.98, lat: 28.52, absorptionRate: 6.8, absorptionRatePrevMonth: 7.2, medianClosePrice: 298000, medianClosePricePrevMonth: 302000, activeInventory: 68, closedSalesThisMonth: 5, totalPlatLots: 2200, lotsRemaining: 1600 },
  // ── Nassau ────────────────────────────────────────────────────────────────────
  { name: "Wildlight", county: "Nassau", builder: "Raydient Places + Properties", lng: -81.73, lat: 30.60, absorptionRate: 10.4, absorptionRatePrevMonth: 9.7, medianClosePrice: 428000, medianClosePricePrevMonth: 419000, activeInventory: 58, closedSalesThisMonth: 7, totalPlatLots: 2800, lotsRemaining: 2200 },
  { name: "Enclave at Wildlight", county: "Nassau", builder: "D.R. Horton", lng: -81.69, lat: 30.58, absorptionRate: 8.2, absorptionRatePrevMonth: 7.6, medianClosePrice: 402000, medianClosePricePrevMonth: 393000, activeInventory: 44, closedSalesThisMonth: 4, totalPlatLots: 960, lotsRemaining: 680 },
  { name: "Tributary at Yulee", county: "Nassau", builder: "Lennar", lng: -81.60, lat: 30.63, absorptionRate: 7.4, absorptionRatePrevMonth: 6.9, medianClosePrice: 389000, medianClosePricePrevMonth: 381000, activeInventory: 38, closedSalesThisMonth: 3, totalPlatLots: 1200, lotsRemaining: 940 },
  // ── Alachua ──────────────────────────────────────────────────────────────────
  { name: "Town of Tioga", county: "Alachua", builder: "Tommy Williams Homes", lng: -82.48, lat: 29.64, absorptionRate: 7.2, absorptionRatePrevMonth: 6.7, medianClosePrice: 348000, medianClosePricePrevMonth: 340000, activeInventory: 48, closedSalesThisMonth: 4, totalPlatLots: 1600, lotsRemaining: 380 },
  { name: "Weseman's Park", county: "Alachua", builder: "Homes by Deltona", lng: -82.38, lat: 29.71, absorptionRate: 5.8, absorptionRatePrevMonth: 5.4, medianClosePrice: 328000, medianClosePricePrevMonth: 321000, activeInventory: 36, closedSalesThisMonth: 2, totalPlatLots: 800, lotsRemaining: 320 },
  // ── Citrus ────────────────────────────────────────────────────────────────────
  { name: "Citrus Hills", county: "Citrus", builder: "Terra Vista Realty", lng: -82.48, lat: 28.81, absorptionRate: 5.8, absorptionRatePrevMonth: 6.1, medianClosePrice: 278000, medianClosePricePrevMonth: 281000, activeInventory: 68, closedSalesThisMonth: 4, totalPlatLots: 8000, lotsRemaining: 2200 },
  { name: "Avalon of Inverness", county: "Citrus", builder: "D.R. Horton", lng: -82.33, lat: 28.84, absorptionRate: 4.4, absorptionRatePrevMonth: 4.8, medianClosePrice: 262000, medianClosePricePrevMonth: 266000, activeInventory: 48, closedSalesThisMonth: 2, totalPlatLots: 1200, lotsRemaining: 680 },
  // ── Baker ─────────────────────────────────────────────────────────────────────
  { name: "Twin Creek Estates", county: "Baker", builder: "Dream Finders Homes", lng: -82.24, lat: 30.32, absorptionRate: 5.2, absorptionRatePrevMonth: 5.6, medianClosePrice: 272000, medianClosePricePrevMonth: 276000, activeInventory: 38, closedSalesThisMonth: 2, totalPlatLots: 960, lotsRemaining: 640 },
  { name: "Macclenny Gardens", county: "Baker", builder: "D.R. Horton", lng: -82.12, lat: 30.28, absorptionRate: 3.4, absorptionRatePrevMonth: 3.8, medianClosePrice: 258000, medianClosePricePrevMonth: 262000, activeInventory: 28, closedSalesThisMonth: 1, totalPlatLots: 560, lotsRemaining: 280 },
];

// ─── public API ────────────────────────────────────────────────────────────────

export function getMockSubdivisionPins(county: string, homeType: HomeType): SubdivisionPin[] {
  const base = SFH_PINS.filter((pin) => pin.county === county);

  return base.map((pin) => {
    const absorptionRate =
      homeType === "townhome" ? Math.round(pin.absorptionRate * 1.1 * 10) / 10 : pin.absorptionRate;
    const absorptionRatePrevMonth =
      homeType === "townhome" ? Math.round(pin.absorptionRatePrevMonth * 1.1 * 10) / 10 : pin.absorptionRatePrevMonth;
    const medianClosePrice = homeType === "townhome" ? Math.round(pin.medianClosePrice * 0.8) : pin.medianClosePrice;
    const medianClosePricePrevMonth =
      homeType === "townhome" ? Math.round(pin.medianClosePricePrevMonth * 0.8) : pin.medianClosePricePrevMonth;

    return {
      ...pin,
      id: slug(pin.county, pin.name),
      homeType,
      absorptionRate,
      absorptionRatePrevMonth,
      medianClosePrice,
      medianClosePricePrevMonth,
      velocityTier: tier(absorptionRate),
    };
  });
}
