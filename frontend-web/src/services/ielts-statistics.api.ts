import api from "@/lib/api";
import type {
  IeltsOverviewStats,
  IeltsFoundationStats,
  IeltsBasicStats,
  IeltsAdvancedStats,
  IeltsIntensiveStats,
} from "@/types";

export const ieltsStatisticsApi = {
  getOverview: async (): Promise<IeltsOverviewStats> => {
    const { data } = await api.get<IeltsOverviewStats>("/ielts-statistics/overview");
    return data;
  },

  getFoundation: async (): Promise<IeltsFoundationStats> => {
    const { data } = await api.get<IeltsFoundationStats>("/ielts-statistics/foundation");
    return data;
  },

  getBasic: async (): Promise<IeltsBasicStats> => {
    const { data } = await api.get<IeltsBasicStats>("/ielts-statistics/basic");
    return data;
  },

  getAdvanced: async (): Promise<IeltsAdvancedStats> => {
    const { data } = await api.get<IeltsAdvancedStats>("/ielts-statistics/advanced");
    return data;
  },

  getIntensive: async (): Promise<IeltsIntensiveStats> => {
    const { data } = await api.get<IeltsIntensiveStats>("/ielts-statistics/intensive");
    return data;
  },
};
