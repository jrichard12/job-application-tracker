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
  Interested: '#6c757d',
  Applied: '#17a2b8',
  Interviewed: '#7b68ee',
  Offered: '#e67e22',
  Accepted: '#27ae60',
  Rejected: '#e74c3c',
};
