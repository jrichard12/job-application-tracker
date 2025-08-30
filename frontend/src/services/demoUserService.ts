import jobData from "../demoData.json";
import type { JobApp, JobAppStatus } from "../types/JobApp";

export function parseJobApps(): JobApp[] {
  return jobData.map((item) => ({
    ...item,
    dateApplied: item.dateApplied ? new Date(item.dateApplied) : undefined,
    deadline: item.deadline ? new Date(item.deadline) : undefined,
    lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : undefined,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    jobStatus: item.jobStatus as JobAppStatus,
  }));
}

export function getDemoUserJobs(): JobApp[] {
  return parseJobApps();
}

