export interface JobApp {
  PK?: string;
  SK?: string;
  createdAt?: Date;
  id: string;
  source: string;
  company: string;
  jobTitle: string;
  salary?: string;
  location?: string;
  description?: string;
  skills?: string[];
  dateApplied?: Date | null;
  interviewed?: boolean;
  deadline?: Date | null;
  lastUpdated?: Date | null;
  jobStatus: JobAppStatus;
  isArchived: boolean;
}

export type JobAppStatus =
  | "Interested"
  | "Applied"
  | "Interviewed"
  | "Offered"
  | "Accepted"
  | "Rejected";

export const jobAppStatusOptions = [
  "Interested",
  "Applied",
  "Interviewed",
  "Offered",
  "Accepted",
  "Rejected",
] as JobAppStatus[];

export const jobStatusColors: Record<JobAppStatus, string> = {
  Interested: '#bdbdbd',
  Applied: '#20a5a6',
  Interviewed: '#1976d2',
  Offered: '#ff9800',
  Accepted: '#388e3c',
  Rejected: '#d32f2f',
};
