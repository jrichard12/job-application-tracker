export interface JobApp {
    id: string,
    source: string,
    company: string,
    jobTitle: string,
    salary: string,
    location: string,
    description: string,
    dateApplied: Date | null,
    deadline: Date | null,
    statusUpdated: Date | null,
    status: JobAppStatus,
};

type JobAppStatus = "Applied" | "Interviewed" | "Offered" | "Accepted" | "Rejected";
