import { extractAndCreateJobApp } from '../services/extraction/extractJobData';
import { getRulesForUrl } from '../services/extraction/extractionRules';
import { JobApp } from '../types/JobApp';

/**
 * Utility function to trigger job extraction and return the data
 * This can be called from the content script or other parts of the extension
 */
export function triggerJobExtraction(): { jobApp: JobApp; success: boolean; errors: string[] } {
  console.log('🚀 triggerJobExtraction - Starting extraction process');
  
  try {
    const { jobApp, extractionResult } = extractAndCreateJobApp();
    
    const errors = extractionResult.errors.map(error => 
      `${error.field}: ${error.message}`
    );
    
    console.log('🚀 triggerJobExtraction - Extraction completed:', {
      success: extractionResult.success,
      jobApp: jobApp,
      errorCount: errors.length,
      errors: errors
    });
    
    return {
      jobApp,
      success: extractionResult.success,
      errors
    };
  } catch (error) {
    console.error('🚀 triggerJobExtraction - Failed to extract job data:', error);
    return {
      jobApp: {
        id: '',
        source: window.location.href,
        company: '',
        jobTitle: '',
        jobStatus: 'Interested',
        isArchived: false
      } as JobApp,
      success: false,
      errors: [`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Check if the current page is supported for job extraction
 */
export function isExtractionSupported(): boolean {
  const url = window.location.href;
  console.log('🔍 isExtractionSupported - Current URL:', url);
  
  const rules = getRulesForUrl(url);
  console.log('🔍 isExtractionSupported - Found rules:', rules ? `Yes (${rules.domain} - ${rules.displayName})` : 'No');
  
  // If we found rules for this URL, then extraction is supported
  return rules !== null;
}

/**
 * Get the name of the job site for display purposes
 */
export function getJobSiteName(): string {
  const url = window.location.href;
  console.log('🔍 getJobSiteName - Current URL:', url);
  
  const rules = getRulesForUrl(url);
  console.log('🔍 getJobSiteName - Found rules:', rules ? `Yes (${rules.displayName})` : 'No');
  
  if (!rules) {
    return 'Unknown Job Site';
  }
  
  return rules.displayName;
}
