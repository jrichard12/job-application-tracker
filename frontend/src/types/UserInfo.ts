import { type JobApp } from "./JobApp";

export interface UserInfo {
  id: string;
  email: string;
  createdAt: string;
  sendNotifications: boolean;
  stats?: UserStats;
  jobApps?: JobApp[];
  jobsLoaded?: boolean; // Track if jobs have been fetched from backend
}

export interface UserStats {
  totalJobsApplied: number;
  totalInterviews: number;
  totalRejections: number;
  totalOffers: number;
  responseRate: number;
  avgResponseTime: number;
}

export const defaultUserStats: UserStats = {
  totalJobsApplied: 0,
  totalInterviews: 0,
  totalRejections: 0,
  totalOffers: 0,
  responseRate: 0,
  avgResponseTime: 0,
};
