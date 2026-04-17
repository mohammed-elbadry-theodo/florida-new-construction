import type { HomeType, SubdivisionPin } from "~components/heatmap/types";
import type BaseError from "~errors/BaseError";
import { heatmapService } from "~services/heatmap";

import { subdivisionPinsQueryKey } from "./keys";

import { useQuery } from "react-query";

const FIVE_MINUTES = 5 * 60 * 1000;

interface ISubdivisionPinsQuery {
  loading: boolean;
  error: BaseError | null;
  subdivisions: SubdivisionPin[] | undefined;
}

function useSubdivisionPins(county: string | null, homeType: HomeType): ISubdivisionPinsQuery {
  const {
    isLoading: loading,
    data,
    error,
  } = useQuery<Awaited<ReturnType<typeof heatmapService.getSubdivisionPins>>, BaseError>(
    subdivisionPinsQueryKey(county ?? "", homeType),
    async () => heatmapService.getSubdivisionPins({ county: county ?? "", homeType }),
    {
      enabled: county !== null && county.trim() !== "",
      staleTime: FIVE_MINUTES,
    },
  );

  return {
    loading,
    error: error ?? null,
    subdivisions: data?.subdivisions,
  };
}

export default useSubdivisionPins;
