import type { JobApp } from '../../types/JobApp';
import type { UserInfo } from '../../types/UserInfo';

// Common job status filtering functions
export const jobFilters = {
  // Total Applications: Any job that isn't in "interested" status
  isValidApplication: (job: JobApp): boolean => 
    job.jobStatus !== undefined && job.jobStatus !== 'Interested',

  // Applications that have been applied to
  isApplied: (job: JobApp): boolean => 
    job.jobStatus === 'Applied',

  // Applications that received any response
  hasResponse: (job: JobApp): boolean => 
    job.jobStatus !== undefined && 
    job.jobStatus !== 'Applied' && 
    job.jobStatus !== 'Interested',

  // Applications that were rejected
  isRejected: (job: JobApp): boolean => 
    job.jobStatus === 'Rejected',

  // Applications with job offers
  hasOffer: (job: JobApp): boolean => 
    job.jobStatus === 'Offered' || job.jobStatus === 'Accepted',

  // Applications with interview dates
  hasInterview: (job: JobApp): boolean => 
    job.interviewDate !== null && job.interviewDate !== undefined,

  // Applications that are not interested or applied (for trend filtering)
  isNotInterestedForTrend: (job: JobApp): boolean => 
    job.jobStatus !== undefined && job.jobStatus !== 'Interested',

  // Applications for response rate calculation (exclude interested and applied)
  isResponseForChart: (job: JobApp): boolean => 
    job.jobStatus !== undefined && 
    !['Interested', 'Applied'].includes(job.jobStatus)
};

// Common calculation functions
export const calculations = {
  // Get total valid applications count
  getTotalApplications: (jobs: JobApp[]): number => 
    jobs.filter(jobFilters.isValidApplication).length,

  // Get total responses count
  getTotalResponses: (jobs: JobApp[]): number => 
    jobs.filter(jobFilters.hasResponse).length,

  // Get total interviews count
  getTotalInterviews: (jobs: JobApp[]): number => 
    jobs.filter(jobFilters.hasInterview).length,

  // Get total offers count
  getTotalOffers: (jobs: JobApp[]): number => 
    jobs.filter(jobFilters.hasOffer).length,

  // Get total rejections count
  getTotalRejections: (jobs: JobApp[]): number => 
    jobs.filter(jobFilters.isRejected).length,

  // Get total applied count
  getTotalApplied: (jobs: JobApp[]): number => 
    jobs.filter(jobFilters.isApplied).length,

  // Calculate response rate percentage
  getResponseRate: (jobs: JobApp[]): number => {
    const totalApplications = calculations.getTotalApplications(jobs);
    const totalResponses = calculations.getTotalResponses(jobs);
    return totalApplications > 0 ? Math.round((totalResponses / totalApplications) * 100) : 0;
  },

  // Calculate interview rate percentage
  getInterviewRate: (jobs: JobApp[]): number => {
    const totalApplications = calculations.getTotalApplications(jobs);
    const totalInterviews = calculations.getTotalInterviews(jobs);
    return totalApplications > 0 ? Math.round((totalInterviews / totalApplications) * 100) : 0;
  },

  // Calculate offer rate percentage (offers vs interviews)
  getOfferRate: (jobs: JobApp[]): number => {
    const totalInterviews = calculations.getTotalInterviews(jobs);
    const totalOffers = calculations.getTotalOffers(jobs);
    return totalInterviews > 0 ? Math.round((totalOffers / totalInterviews) * 100) : 0;
  }
};

// Utility functions for data processing
export const dataUtils = {
  // Group jobs by month for charts
  groupJobsByMonth: (jobs: JobApp[], filterFn?: (job: JobApp) => boolean) => {
    const filteredJobs = filterFn ? jobs.filter(filterFn) : jobs;
    
    return filteredJobs.reduce((acc, job) => {
      if (!job.dateApplied) return acc;
      
      const date = new Date(job.dateApplied);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(job);
      
      return acc;
    }, {} as Record<string, JobApp[]>);
  },

  // Group jobs by week for trend analysis
  groupJobsByWeek: (jobs: JobApp[], filterFn?: (job: JobApp) => boolean) => {
    const filteredJobs = filterFn ? jobs.filter(filterFn) : jobs;
    
    return filteredJobs.reduce((acc, job) => {
      if (!job.dateApplied) return acc;
      
      const date = new Date(job.dateApplied);
      const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = startOfWeek.toISOString().split('T')[0];
      
      if (!acc[weekKey]) {
        acc[weekKey] = 0;
      }
      acc[weekKey]++;
      
      return acc;
    }, {} as Record<string, number>);
  },

  // Format date for display
  formatDateForDisplay: (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },

  // Calculate days until a date
  getDaysUntil: (targetDate: Date): number => {
    const currentDate = new Date();
    
    // Normalize both dates to midnight (start of day) for accurate day counting
    const currentMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    
    // Calculate difference in days
    const diffInMs = targetMidnight.getTime() - currentMidnight.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  }
};

// Get all core statistics for a user
export const getCoreStats = (userInfo: UserInfo | null) => {
  if (!userInfo?.jobApps) {
    return {
      totalApplications: 0,
      totalApplied: 0,
      totalRejections: 0,
      totalOffers: 0,
      totalInterviews: 0,
      totalResponses: 0,
      responseRate: 0,
      interviewRate: 0,
      offerRate: 0
    };
  }

  const jobs = userInfo.jobApps;
  
  return {
    totalApplications: calculations.getTotalApplications(jobs),
    totalApplied: calculations.getTotalApplied(jobs),
    totalRejections: calculations.getTotalRejections(jobs),
    totalOffers: calculations.getTotalOffers(jobs),
    totalInterviews: calculations.getTotalInterviews(jobs),
    totalResponses: calculations.getTotalResponses(jobs),
    responseRate: calculations.getResponseRate(jobs),
    interviewRate: calculations.getInterviewRate(jobs),
    offerRate: calculations.getOfferRate(jobs)
  };
};