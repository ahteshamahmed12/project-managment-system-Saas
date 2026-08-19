import { reportSummary } from "../data/reportData";
import type { ReportSummary } from "../types";

/**
 * API-ready boundary.
 * Replace this function with fetch/axios later:
 *
 * export async function getReportSummary(filters: ReportFilters) {
 *   const res = await fetch(`/api/reports/summary?...`);
 *   return res.json();
 * }
 */
export const reportRepository = {
  async getReportSummary(): Promise<ReportSummary> {
    return Promise.resolve(reportSummary);
  },
};
