import { ExtensionAuthService } from './authService';
import { JobApp } from '../types/JobApp';
import { EXTENSION_CONFIG } from '../config/config';

export class JobService {
  /**
   * Save a new job application to the backend
   */
  static async saveJobApplication(jobApp: JobApp): Promise<JobApp> {
    try {
      const userId = await ExtensionAuthService.getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Transform the job data for the backend (same as frontend)
      const jobToSave = this.transformJobForBackend(jobApp);

      console.log('Saving job application:', jobToSave);

      const response = await ExtensionAuthService.makeAuthenticatedRequest(EXTENSION_CONFIG.JOB_HANDLER_URL, {
        method: 'POST',
        body: JSON.stringify({
          userId: userId,
          job: jobToSave
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save job application: ${response.status} ${response.statusText}`);
      }

      const savedJob = await response.json();
      console.log('Job application saved successfully:', savedJob);

      return this.transformJobFromBackend(savedJob);
    } catch (error) {
      console.error('Error saving job application:', error);
      throw error;
    }
  }

  /**
   * Transform job data for sending to backend
   * This ensures dates are properly serialized and the structure matches backend expectations
   */
  private static transformJobForBackend(jobApp: JobApp): any {
    const transformed: any = { ...jobApp };

    // Convert Date objects to ISO strings for backend storage
    if (transformed.deadline && transformed.deadline instanceof Date) {
      transformed.deadline = transformed.deadline.toISOString();
    }
    if (transformed.dateApplied && transformed.dateApplied instanceof Date) {
      transformed.dateApplied = transformed.dateApplied.toISOString();
    }
    if (transformed.lastUpdated && transformed.lastUpdated instanceof Date) {
      transformed.lastUpdated = transformed.lastUpdated.toISOString();
    }
    if (transformed.createdAt && transformed.createdAt instanceof Date) {
      transformed.createdAt = transformed.createdAt.toISOString();
    }

    return transformed;
  }

  /**
   * Transform job data received from backend
   * This ensures dates are converted back to Date objects for frontend use
   */
  private static transformJobFromBackend(jobData: any): JobApp {
    const transformed = { ...jobData };

    // Convert ISO strings back to Date objects
    if (transformed.deadline) {
      transformed.deadline = new Date(transformed.deadline);
    }
    if (transformed.dateApplied) {
      transformed.dateApplied = new Date(transformed.dateApplied);
    }
    if (transformed.lastUpdated) {
      transformed.lastUpdated = new Date(transformed.lastUpdated);
    }
    if (transformed.createdAt) {
      transformed.createdAt = new Date(transformed.createdAt);
    }

    return transformed as JobApp;
  }
}
