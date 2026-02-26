import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "@/shared/api/http";

export const useComprehensiveStats = () =>
  useQuery({
    queryKey: ["statistics", "comprehensive"],
    queryFn: () => statsAPI.getComprehensive().then((r) => r.data),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

export const useTrends = (params) =>
  useQuery({
    queryKey: ["statistics", "trends", params],
    queryFn: () => statsAPI.getTrends(params).then((r) => r.data),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

export const useRegionalDetailed = (params) =>
  useQuery({
    queryKey: ["statistics", "regional", params],
    queryFn: () => statsAPI.getRegionalDetailed(params).then((r) => r.data),
    staleTime: 15_000,
  });
