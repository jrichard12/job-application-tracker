export interface JobApp {
    id: string,
    source: string,
    company: string,
    jobTitle: string,
    salary?: string,
    location?: string,
    description?: string,
    skills?: string[],
    dateApplied?: Date | null,
    deadline?: Date | null,
    statusUpdated?: Date | null,
    status: JobAppStatus,
};

type JobAppStatus = "Interested" | "Applied" | "Interviewed" | "Offered" | "Accepted" | "Rejected";

export const jobAppStatusOptions = [
  "Interested",
  "Applied",
  "Interviewed",
  "Offered",
  "Accepted",
  "Rejected"
] as JobAppStatus[];