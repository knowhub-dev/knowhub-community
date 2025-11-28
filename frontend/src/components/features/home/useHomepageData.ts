'use client';

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

import type {
  ActivityEvent,
  ActivityFeedResponse,
  HomepageStatsResponse,
  SystemStatusSummary,
  WeeklyHeroesResponse,
} from "./types";

export interface HomepageDataState {
  homeStats: HomepageStatsResponse | null;
  heroes: WeeklyHeroesResponse | null;
  feed: ActivityEvent[];
  systemStatus: SystemStatusSummary | null;
  loading: boolean;
  error: string | null;
}

const initialHomepageState: HomepageDataState = {
  homeStats: null,
  heroes: null,
  feed: [],
  systemStatus: null,
  loading: true,
  error: null,
};

export function useHomepageData(): HomepageDataState {
  const [state, setState] = useState<HomepageDataState>(initialHomepageState);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    (async () => {
      const issues: string[] = [];
      try {
        const [statsResult, heroesResult, feedResult, statusResult] = await Promise.allSettled([
          api.get<HomepageStatsResponse>("/stats/homepage"),
          api.get<WeeklyHeroesResponse>("/stats/weekly-heroes"),
          api.get<ActivityFeedResponse>("/activity-feed", { params: { limit: 12 } }),
          api.get<SystemStatusSummary>("/status/summary"),
        ]);

        if (!active) return;

        setState((prev) => ({
          ...prev,
          homeStats: statsResult.status === "fulfilled" ? statsResult.value.data ?? null : null,
          heroes: heroesResult.status === "fulfilled" ? heroesResult.value.data ?? null : null,
          feed: feedResult.status === "fulfilled" ? feedResult.value.data?.data ?? [] : [],
          systemStatus: statusResult.status === "fulfilled" ? statusResult.value.data ?? null : null,
        }));

        if (statsResult.status !== "fulfilled") issues.push("Bosh sahifa statistikasi yuklanmadi");
        if (statusResult.status !== "fulfilled") issues.push("Tizim holati yangilanmadi");
      } catch (err: unknown) {
        issues.push(err instanceof Error ? err.message : "Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        if (active) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: issues.length ? issues.join(". ") : null,
          }));
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
