import { ExtractionRuleSet } from '../types';

/**
 * Template for creating new extraction rules
 * 
 * To add a new job site:
 * 1. Copy this file and rename it (e.g., workday.ts, bamboohr.ts)
 * 2. Update the domain and urlPattern
 * 3. Define CSS selectors for each field
 * 4. Test the selectors on the target website
 * 5. Add the import to ../extractionRules.ts
 * 6. The rules will be automatically included in the extraction process
 */

export const templateRules: ExtractionRuleSet = {
  // The domain to match (without www.)
  domain: 'example-job-site.com',
  
  // Human-readable display name for the job site
  displayName: 'Example Job Site',
  
  // Optional: specific URL pattern to match (use regex)
  // urlPattern: /\/jobs\/\d+/,
  
  rules: [
    {
      field: 'jobTitle',
      selector: '.job-title, h1.title', // CSS selector(s) - can use multiple selectors separated by commas
      attribute: 'textContent' // What to extract: 'textContent', 'innerText', 'href', 'value', or any attribute name
    },
    {
      field: 'company',
      selector: '.company-name, [data-company]',
      attribute: 'textContent'
    },
    {
      field: 'location',
      selector: '.job-location, .location',
      attribute: 'textContent'
    },
    {
      field: 'salary',
      selector: '.salary, .pay-range',
      attribute: 'textContent'
    },
    {
      field: 'description',
      selector: '.job-description, .description',
      attribute: 'textContent'
    },
    {
      field: 'source',
      selector: '', // Leave empty for source - it will use current URL
      attribute: '',
      transform: () => window.location.href // This ensures source is always the current URL
    }
    
    // Optional: Extract skills directly if the site has them
    // {
    //   field: 'skills',
    //   selector: '.skills-list .skill',
    //   attribute: 'textContent',
    //   transform: (value: string) => [value] // Convert single skill to array
    // }
  ]
};

// Don't forget to:
// 1. Import your rules in ../extractionRules.ts
// 2. The displayName will automatically be used by getJobSiteName() function
// 3. The domain will automatically be detected by isExtractionSupported() function
