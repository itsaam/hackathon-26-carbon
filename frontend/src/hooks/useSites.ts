import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

const EMPTY_SITES: Site[] = [];
const EMPTY_RESULTS: CarbonResult[] = [];

export interface Site {
  id: number;
  name: string;
  surfaceM2: number;
  employeeCount: number;
  workstationCount: number;
  parkingUnderground: number;
  parkingBasement: number;
  parkingOutdoor: number;
  energyConsumptionKwh: number;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  internalCode?: string | null;
  externalCode?: string | null;
  buildingType?: string | null;
  usageType?: string | null;
  yearOfConstruction?: number | null;
  yearOfRenovation?: number | null;
  floorsCount?: number | null;
  heatedAreaM2?: number | null;
  cooledAreaM2?: number | null;
  occupancyDaysPerWeek?: number | null;
  occupancyHoursPerDay?: number | null;
  averageOccupancyRate?: number | null;
  electricityConsumptionKwh?: number | null;
  gasConsumptionKwh?: number | null;
  fuelOilConsumptionKwh?: number | null;
  districtHeatingConsumptionKwh?: number | null;
  renewableProductionKwh?: number | null;
  renewableSelfConsumptionRate?: number | null;
  activityDescription?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  lastCo2Total?: number | null; // kg
}

export interface CarbonResult {
  id: number;
  siteId: number;
  constructionCo2Kg: number | null;
  exploitationCo2Kg: number | null;
  totalCo2Kg: number | null;
  co2PerM2: number | null;
  co2PerEmployee: number | null;
   periodStart?: string | null;
   periodEnd?: string | null;
   year?: number | null;
   scope1Co2Kg?: number | null;
   scope2Co2Kg?: number | null;
   scope3Co2Kg?: number | null;
   buildingStructureCo2Kg?: number | null;
   parkingCo2Kg?: number | null;
   energyUseCo2Kg?: number | null;
   otherCo2Kg?: number | null;
   calculationVersion?: string | null;
   factorsSource?: string | null;
   comment?: string | null;
  calculatedAt: string;
}

export function useSites() {
  const sitesQuery = useQuery({
    queryKey: ["sites"],
    queryFn: () => apiFetch<Site[]>("/api/sites"),
  });

  const resultsQuery = useQuery({
    queryKey: ["results"],
    queryFn: () => apiFetch<CarbonResult[]>("/api/results"),
  });

  const sites = sitesQuery.data ?? EMPTY_SITES;
  const results = resultsQuery.data ?? EMPTY_RESULTS;

  const latestResultBySiteId = useMemo(() => {
    const map = new Map<number, CarbonResult>();
    for (const r of results) {
      if (!map.has(r.siteId)) map.set(r.siteId, r);
    }
    return map;
  }, [results]);

  const getSite = (id: number): Site | undefined => sites.find((s) => s.id === id);
  const getLatestResult = (siteId: number): CarbonResult | undefined => latestResultBySiteId.get(siteId);

  return {
    sites,
    loading: sitesQuery.isLoading || resultsQuery.isLoading,
    error: sitesQuery.error ?? resultsQuery.error,
    refetch: async () => {
      await Promise.all([sitesQuery.refetch(), resultsQuery.refetch()]);
    },
    getSite,
    getLatestResult,
    results,
  };
}
