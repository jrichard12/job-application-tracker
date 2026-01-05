import type { JobApp } from "../types/JobApp";

// Type for job data when sending to API (dates are serialized as strings)
type JobUpdatePayload = Omit<JobApp, 'deadline' | 'dateApplied' | 'interviewDate' | 'rejectedDate' | 'lastUpdated' | 'createdAt'> & {
  deadline?: string | null;
  dateApplied?: string | null;
  interviewDate?: string | null;
  rejectedDate?: string | null;
  lastUpdated?: string | null;
  createdAt?: string | null;
};

const jobHandlerUrl = `${import.meta.env.VITE_API_URL}/job`;

const getJobs = async (authToken: string): Promise<JobApp[]> => {
  try {
    const response = await fetch(jobHandlerUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch jobs (${response.status})`
      );
    }

    const jobs: JobApp[] = await response.json();
    return jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

const createJob = async (authToken: string, jobData: JobApp): Promise<JobApp> => {
  try {
    const response = await fetch(jobHandlerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        job: jobData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create job (${response.status})`
      );
    }

    const createdJob: JobApp = await response.json();
    return createdJob;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

const updateJob = async (authToken: string, jobData: JobUpdatePayload): Promise<JobApp> => {
  try {
    const response = await fetch(jobHandlerUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ job: jobData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update job (${response.status})`
      );
    }

    const updatedJob: JobApp = await response.json();
    return updatedJob;
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

const deleteJob = async (authToken: string, SK: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${jobHandlerUrl}?SK=${encodeURIComponent(SK)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete job (${response.status})`
      );
    }

    const result: { message: string } = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

export { getJobs, createJob, updateJob, deleteJob };