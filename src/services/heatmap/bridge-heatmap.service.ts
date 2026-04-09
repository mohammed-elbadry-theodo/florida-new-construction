import type { CountyMetric, HomeType, VelocityTier } from "~components/heatmap/types";

import axios from "axios";

const BRIDGE_BASE = process.env["BRIDGE_API_BASE_URL"] ?? "https://api.bridgedataoutput.com/api/v2/OData";
const BRIDGE_DATASET = process.env["BRIDGE_DATASET_ID"] ?? "";
const BRIDGE_TOKEN = process.env["BRIDGE_SERVER_TOKEN"] ?? "";

const PAGE_SIZE = 200;
const MAX_PAGES = 50; // safety cap — max 10 000 records per query

// All 23 target counties in scope
const TARGET_COUNTIES = [
  "St. Lucie",
  "Indian River",
  "Brevard",
  "Osceola",
  "Orange",
  "Seminole",
  "Lake",
  "Sumter",
  "Polk",
  "Hillsborough",
  "Manatee",
  "Pasco",
  "Hernando",
  "Citrus",
  "Marion",
  "Volusia",
  "Flagler",
  "St. Johns",
  "Clay",
  "Baker",
  "Alachua",
  "Duval",
  "Nassau",
] as const;

// Bridge OData property type values — confirmed via Metrique.md
const PROPERTY_TYPE_MAP: Record<HomeType, string> = {
  sfh: "Residential",
  townhome: "Residential Income",
};

// Pre-built county OR fragment, reused across queries
const COUNTY_OR_FRAGMENT = TARGET_COUNTIES.map((county) => `CountyOrParish eq '${county}'`).join(" or ");

interface BridgeProperty {
  ListingKey: string;
  StandardStatus: string;
  CountyOrParish: string;
  PropertyType: string;
  ClosePrice?: number;
  CloseDate?: string;
}

interface BridgeODataResponse {
  value: BridgeProperty[];
}

// ─── helpers ────────────────────────────────────────────────────────────────

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((valueA, valueB) => valueA - valueB);
  const mid = Math.floor(sorted.length / 2);
  const isEven = sorted.length % 2 === 0;
  return isEven ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2 : sorted[mid] ?? 0;
}

function getVelocityTier(rate: number): VelocityTier {
  if (rate >= 10) return "high";
  if (rate >= 5) return "medium";
  return "low";
}

// ─── Bridge API fetch ────────────────────────────────────────────────────────

async function fetchAllPages(filter: string): Promise<BridgeProperty[]> {
  const url = `${BRIDGE_BASE}/${BRIDGE_DATASET}/Property`;
  const select = "ListingKey,StandardStatus,CountyOrParish,PropertyType,ClosePrice,CloseDate";

  const records: BridgeProperty[] = [];
  let skip = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    // Sequential pagination is required — each page depends on whether the previous was full
    // eslint-disable-next-line no-await-in-loop
    const { data } = await axios.get<BridgeODataResponse>(url, {
      headers: { Authorization: `Bearer ${BRIDGE_TOKEN}` },
      params: {
        $filter: filter,
        $select: select,
        $top: PAGE_SIZE,
        $skip: skip,
      },
    });

    const batch = data.value;
    records.push(...batch);

    if (batch.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }

  return records;
}

// ─── metric computation ──────────────────────────────────────────────────────

function buildCountyMetrics(
  activeRecords: BridgeProperty[],
  closedCurrent: BridgeProperty[],
  closedPrev: BridgeProperty[],
): CountyMetric[] {
  // Group by county
  const activeCount = new Map<string, number>();
  const currentByCounty = new Map<string, BridgeProperty[]>();
  const prevByCounty = new Map<string, BridgeProperty[]>();

  for (const record of activeRecords) {
    activeCount.set(record.CountyOrParish, (activeCount.get(record.CountyOrParish) ?? 0) + 1);
  }
  for (const record of closedCurrent) {
    const list = currentByCounty.get(record.CountyOrParish) ?? [];
    list.push(record);
    currentByCounty.set(record.CountyOrParish, list);
  }
  for (const record of closedPrev) {
    const list = prevByCounty.get(record.CountyOrParish) ?? [];
    list.push(record);
    prevByCounty.set(record.CountyOrParish, list);
  }

  return TARGET_COUNTIES.map((county) => {
    const active = activeCount.get(county) ?? 0;
    const currentClosed = currentByCounty.get(county) ?? [];
    const prevClosed = prevByCounty.get(county) ?? [];

    const closedCount = currentClosed.length;
    const prevClosedCount = prevClosed.length;

    // Absorption rate = closed / (active + closed) × 100
    // Denominator approximates "inventory at month start" per Metrique.md
    const denomCurrent = active + closedCount;
    const denomPrev = active + prevClosedCount;

    const absorptionRate = denomCurrent > 0 ? (closedCount / denomCurrent) * 100 : 0;
    const absorptionRatePrev = denomPrev > 0 ? (prevClosedCount / denomPrev) * 100 : 0;

    const pricesCurrent = currentClosed.map((record) => record.ClosePrice ?? 0).filter((price) => price > 0);
    const pricesPrev = prevClosed.map((record) => record.ClosePrice ?? 0).filter((price) => price > 0);

    return {
      county,
      absorptionRate: Math.round(absorptionRate * 10) / 10,
      absorptionRatePrevMonth: Math.round(absorptionRatePrev * 10) / 10,
      medianClosePrice: Math.round(computeMedian(pricesCurrent)),
      medianClosePricePrevMonth: Math.round(computeMedian(pricesPrev)),
      activeInventory: active,
      closedSalesThisMonth: closedCount,
      velocityTier: getVelocityTier(absorptionRate),
    };
  });
}

// ─── public API ──────────────────────────────────────────────────────────────

interface DateRange {
  currentMonthStart: string;
  currentMonthEnd: string;
  prevMonthStart: string;
  prevMonthEnd: string;
}

export async function getCountyMetrics(homeType: HomeType, dateRange: DateRange): Promise<CountyMetric[]> {
  const { currentMonthStart, currentMonthEnd, prevMonthStart, prevMonthEnd } = dateRange;
  const propertyType = PROPERTY_TYPE_MAP[homeType];
  const countyFilter = `(${COUNTY_OR_FRAGMENT})`;
  const typeFilter = `PropertyType eq '${propertyType}'`;

  const activeFilter = `${typeFilter} and StandardStatus eq 'Active' and ${countyFilter}`;
  const closedCurrentFilter =
    `${typeFilter} and StandardStatus eq 'Closed' ` +
    `and CloseDate ge ${currentMonthStart} and CloseDate le ${currentMonthEnd} ` +
    `and ${countyFilter}`;
  const closedPrevFilter =
    `${typeFilter} and StandardStatus eq 'Closed' ` +
    `and CloseDate ge ${prevMonthStart} and CloseDate le ${prevMonthEnd} ` +
    `and ${countyFilter}`;

  const [activeRecords, closedCurrent, closedPrev] = await Promise.all([
    fetchAllPages(activeFilter),
    fetchAllPages(closedCurrentFilter),
    fetchAllPages(closedPrevFilter),
  ]);

  return buildCountyMetrics(activeRecords, closedCurrent, closedPrev);
}
