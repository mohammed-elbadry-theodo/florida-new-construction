import type { SubdivisionPin, VelocityTier } from "~components/heatmap/types";
import type { SortBy } from "~store/heatmap/slice";

export interface BuilderSummary {
  name: string;
  invUnits: number;
  marketSharePct: number;
  activeSubdivisions: number;
  avgVelocity: number;
  velocityTier: VelocityTier;
  communities: SubdivisionPin[];
}

function getVelocityTier(avgVelocity: number): VelocityTier {
  if (avgVelocity >= 10) return "high";
  if (avgVelocity >= 5) return "medium";
  return "low";
}

function useBuilderPresence(pins: SubdivisionPin[] | undefined, sortBy: SortBy): BuilderSummary[] {
  if (!pins || pins.length === 0) return [];

  const byBuilder = new Map<string, SubdivisionPin[]>();
  for (const pin of pins) {
    const existing = byBuilder.get(pin.builder) ?? [];
    existing.push(pin);
    byBuilder.set(pin.builder, existing);
  }

  const totalInventory = pins.reduce((sum, p) => sum + p.activeInventory, 0);

  const summaries: BuilderSummary[] = Array.from(byBuilder.entries()).map(([name, communities]) => {
    const invUnits = communities.reduce((sum, p) => sum + p.activeInventory, 0);
    const avgVelocity =
      communities.reduce((sum, p) => sum + p.closedSalesThisMonth, 0) / communities.length;
    const marketSharePct = totalInventory > 0 ? (invUnits / totalInventory) * 100 : 0;

    return {
      name,
      invUnits,
      marketSharePct,
      activeSubdivisions: communities.length,
      avgVelocity,
      velocityTier: getVelocityTier(avgVelocity),
      communities,
    };
  });

  return summaries.sort((a, b) => {
    switch (sortBy) {
      case "price":
        return (
          b.communities.reduce((s, p) => s + p.medianClosePrice, 0) / b.communities.length -
          a.communities.reduce((s, p) => s + p.medianClosePrice, 0) / a.communities.length
        );
      case "builder":
        return a.name.localeCompare(b.name);
      case "market_share":
        return b.marketSharePct - a.marketSharePct;
      case "velocity":
      default:
        return b.avgVelocity - a.avgVelocity;
    }
  });
}

export default useBuilderPresence;
