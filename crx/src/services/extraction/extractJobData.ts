import { v4 as uuidv4 } from 'uuid';
import { JobApp } from '../../types/JobApp';
import { ExtractionRule, ExtractionResult, JobAppExtractionFields, ExtractionError } from './types';
import { getRulesForUrl } from './extractionRules';

/**
 * Extracts a single field value from the DOM using the provided rule
 */
function extractFieldValue(rule: ExtractionRule): string | null {
  try {
    // Handle transform functions (like getting current URL)
    if (rule.transform && !rule.selector) {
      return rule.transform('');
    }

    const elements = document.querySelectorAll(rule.selector);
    
    if (elements.length === 0) {
      return null;
    }

    const element = elements[0];
    
    // Default to textContent if no attribute specified
    const attribute = rule.attribute || 'textContent';
    
    let value: string | null = null;
    
    switch (attribute) {
      case 'textContent':
        value = element.textContent?.trim() || null;
        break;
      case 'innerText':
        value = (element as HTMLElement).innerText?.trim() || null;
        break;
      case 'href':
        value = (element as HTMLAnchorElement).href || null;
        break;
      case 'value':
        value = (element as HTMLInputElement).value?.trim() || null;
        break;
      default:
        value = element.getAttribute(attribute)?.trim() || null;
        break;
    }

    // Apply transform function if provided
    if (value && rule.transform) {
      return rule.transform(value);
    }

    return value;
  } catch (error) {
    console.error(`Error extracting field ${rule.field} with selector ${rule.selector}:`, error);
    return null;
  }
}

/**
 * Extracts skills from job description text using common patterns
 */
function extractSkillsFromText(description: string): string[] {
  if (!description) return [];

  const skills: string[] = [];
  const skillPatterns = [
    // Programming languages - specific patterns first to avoid conflicts
    /\bC\+\+\b/gi,         // C++ first
    /C#/gi,                // C# 
    /\b(JavaScript|TypeScript|Python|Java|PHP|Ruby|Rust|Kotlin|Swift)\b/gi,
    /\bGo\b(?![a-z])/gi,   // Go but not "Google" etc
    /\bC\b(?![#\+a-z])/gi, // Standalone C
    /\bR\b(?![a-z])/gi,    // Standalone R
    // Frameworks and libraries
    /\b(React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel|Rails|Next\.js|\.NET)\b/gi,
    // UI
    /\b(Tailwind|Bootstrap|Svelte|CSS3|HTML5|Sass)\b/gi,
    // Testing
    /\b(Jest|Mocha|Chai|Cypress|Selenium|JUnit|TestNG|Postman)\b/gi,
    // Databases
    /\b(MySQL|PostgreSQL|MongoDB|Redis|DynamoDB|Oracle|SQL Server|NoSQL|SQL|MariaDB|Firebase)\b/gi,
    // Cloud platforms
    /\b(AWS|Azure|Google Cloud|GCP|Docker|Kubernetes)\b/gi,
    // Tools and methodologies
    /\b(Git|GitHub|GitLab|Jira|Agile|Scrum|CI\/CD|DevOps|Terraform|CDK|CloudFormation)\b/gi
  ];

  skillPatterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      skills.push(...matches.map(match => match.trim()));
    }
  });

  // Remove duplicates and return
  return [...new Set(skills)];
}

/**
 * Extracts job data from the current webpage using predefined rules
 */
export function extractJobData(): ExtractionResult {
  const currentUrl = window.location.href;
  const rules = getRulesForUrl(currentUrl);
  
  if (!rules) {
    console.log('No extraction rules found for URL:', currentUrl);
    return {
      success: false,
      data: { source: currentUrl },
      errors: [{
        field: 'general',
        selector: '',
        message: `No extraction rules defined for domain: ${new URL(currentUrl).hostname}`
      }]
    };
  }

  console.log('Found extraction rules for domain:', rules.domain);
  
  const extractedData: Partial<JobAppExtractionFields> = {};
  const errors: ExtractionError[] = [];

  // Extract each field according to the rules
  rules.rules.forEach(rule => {
    try {
      const value = extractFieldValue(rule);
      
      if (value) {
        if (rule.field === 'skills') {
          // Special handling for skills - extract from description if no direct skills found
          extractedData[rule.field] = [value]; // Assume single skill value for now
        } else {
          extractedData[rule.field] = value;
        }
        console.log(`Extracted ${rule.field}:`, value);
      } else {
        console.log(`Could not extract ${rule.field} using selector: ${rule.selector}`);
        errors.push({
          field: rule.field,
          selector: rule.selector,
          message: `No element found for selector: ${rule.selector}`
        });
      }
    } catch (error) {
      console.error(`Error extracting ${rule.field}:`, error);
      errors.push({
        field: rule.field,
        selector: rule.selector,
        message: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  // Try to extract skills from description if no direct skills were found
  if (!extractedData.skills && extractedData.description) {
    const skillsFromDescription = extractSkillsFromText(extractedData.description);
    if (skillsFromDescription.length > 0) {
      extractedData.skills = skillsFromDescription;
      console.log('Extracted skills from description:', skillsFromDescription);
    }
  }

  // Ensure source is always set to current URL
  extractedData.source = currentUrl;

  return {
    success: Object.keys(extractedData).length > 1, // Success if we extracted more than just the source
    data: extractedData,
    errors
  };
}

/**
 * Creates a JobApp object from extracted data, filling in required fields with defaults
 */
export function createJobAppFromExtraction(extractionResult: ExtractionResult): JobApp {
  const { data } = extractionResult;
  
  return {
    id: uuidv4(),
    source: data.source || window.location.href,
    company: data.company || '',
    jobTitle: data.jobTitle || '',
    salary: data.salary || undefined,
    location: data.location || undefined,
    description: data.description || undefined,
    skills: data.skills || undefined,
    dateApplied: null,
    deadline: null,
    lastUpdated: new Date(),
    jobStatus: 'Interested',
    isArchived: false,
    createdAt: new Date()
  };
}

/**
 * Helper function to get the current domain
 */
export function getCurrentDomain(): string {
  try {
    return new URL(window.location.href).hostname.replace('www.', '');
  } catch (error) {
    console.error('Error getting current domain:', error);
    return '';
  }
}

/**
 * Main function to extract job data and populate a JobApp object
 * This is the function that will be called to trigger the extraction process
 */
export function extractAndCreateJobApp(): { jobApp: JobApp; extractionResult: ExtractionResult } {
  console.log('Starting job data extraction for URL:', getCurrentDomain());
  
  const extractionResult = extractJobData();
  const jobApp = createJobAppFromExtraction(extractionResult);
  
  console.log('Extraction complete:', {
    success: extractionResult.success,
    extractedFields: Object.keys(extractionResult.data),
    errors: extractionResult.errors.length
  });
  
  return {
    jobApp,
    extractionResult
  };
}
