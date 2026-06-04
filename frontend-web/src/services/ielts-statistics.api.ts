import api from "@/lib/api";
import type {
  IeltsOverviewStats,
  IeltsFoundationStats,
  IeltsBasicStats,
  IeltsAdvancedStats,
  IeltsIntensiveStats,
} from "@/types";

export const ieltsStatisticsApi = {
  getOverview: async (studentId?: string): Promise<IeltsOverviewStats> => {
    const { data } = await api.get<IeltsOverviewStats>("/ielts-statistics/overview", {
      params: studentId ? { studentId } : undefined,
    });
    return data;
  },

  getFoundation: async (studentId?: string): Promise<IeltsFoundationStats> => {
    const { data } = await api.get<IeltsFoundationStats>("/ielts-statistics/foundation", {
      params: studentId ? { studentId } : undefined,
    });
    return data;
  },

  getBasic: async (studentId?: string): Promise<IeltsBasicStats> => {
    const { data } = await api.get<IeltsBasicStats>("/ielts-statistics/basic", {
      params: studentId ? { studentId } : undefined,
    });
    return data;
  },

  getAdvanced: async (studentId?: string): Promise<IeltsAdvancedStats> => {
    const { data } = await api.get<IeltsAdvancedStats>("/ielts-statistics/advanced", {
      params: studentId ? { studentId } : undefined,
    });
    return data;
  },

  getIntensive: async (studentId?: string): Promise<IeltsIntensiveStats> => {
    const { data } = await api.get<IeltsIntensiveStats>("/ielts-statistics/intensive", {
      params: studentId ? { studentId } : undefined,
    });
    return data;
  },
};
