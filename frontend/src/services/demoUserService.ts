import jobData from "../demoData.json";
import type { JobApp, JobAppStatus } from "../types/JobApp";

interface DemoJobData {
  id: string;
  source: string;
  company: string;
  jobTitle: string;
  salary?: string;
  location?: string;
  description?: string;
  skills?: string[];
  createdAt?: string;
  dateApplied?: string;
  deadline?: string | null;
  interviewDate?: string;
  rejectedDate?: string;
  lastUpdated?: string;
  jobStatus: string;
  isArchived: boolean;
}

export function parseJobApps(): JobApp[] {
  return (jobData as DemoJobData[]).map((item) => ({
    ...item,
    dateApplied: item.dateApplied ? new Date(item.dateApplied) : undefined,
    deadline: item.deadline ? new Date(item.deadline) : undefined,
    lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : undefined,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    interviewDate: item.interviewDate ? new Date(item.interviewDate) : undefined,
    rejectedDate: item.rejectedDate ? new Date(item.rejectedDate) : undefined,
    jobStatus: item.jobStatus as JobAppStatus,
  }));
}

export function getDemoUserJobs(): JobApp[] {
  return parseJobApps();
}

