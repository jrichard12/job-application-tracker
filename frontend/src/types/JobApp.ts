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
  deadline?: Date | null;
  lastUpdated?: Date | null;
  jobStatus: JobAppStatus;
  isArchived: boolean;
}

type JobAppStatus =
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
