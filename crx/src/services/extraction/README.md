# Job Data Extraction Service

This service provides automated extraction of job posting data from various job sites to populate the job application form in the Chrome extension.

## Overview

The extraction service consists of several components:

1. **Types** (`types.ts`) - TypeScript interfaces for extraction rules and results
2. **Extraction Rules** (`extractionRules.ts`) - Main rules aggregator that imports from individual rule files
3. **Rules Directory** (`rules/`) - Individual rule files for each job site
4. **Extract Job Data** (`extractJobData.ts`) - Main extraction logic
5. **Utility Functions** (`../utils/extractionUtils.ts`) - Helper functions for the extension

## Supported Job Sites

Currently supports extraction from:
- LinkedIn Jobs
- Indeed
- Glassdoor
- Lever (jobs.lever.co)
- Greenhouse (greenhouse.io)

## How It Works

1. **URL Detection**: The service detects the current website URL and matches it against predefined rules
2. **Field Extraction**: Uses CSS selectors to extract job data (title, company, location, etc.)
3. **Error Handling**: Logs errors but doesn't break if selectors fail to find elements
4. **JobApp Creation**: Creates a `JobApp` object with extracted data and sensible defaults

## Usage

### Basic Extraction

```typescript
import { extractAndCreateJobApp } from './services/extraction/extractJobData';

// Extract job data from current page
const { jobApp, extractionResult } = extractAndCreateJobApp();

if (extractionResult.success) {
  console.log('Extracted job data:', jobApp);
  // Populate your modal with jobApp data
} else {
  console.log('Extraction failed:', extractionResult.errors);
  // Show empty modal or partial data
}
```

### Using Utility Functions

```typescript
import { triggerJobExtraction, isExtractionSupported } from './utils/extractionUtils';

// Check if current site is supported
if (isExtractionSupported()) {
  const { jobApp, success, errors } = triggerJobExtraction();
  
  if (success) {
    // Populate CreateAppModal with extracted data
    setNewJobApp(jobApp);
  } else {
    console.log('Extraction errors:', errors);
  }
}
```

## Integration with CreateAppModal

To integrate with the existing `CreateAppModal`:

1. Add an "Extract from Page" button to the modal
2. Call `triggerJobExtraction()` when button is clicked
3. Use the returned `jobApp` object to populate the form fields
4. Allow user to review and edit before saving

Example integration:

```typescript
const handleExtractFromPage = () => {
  const { jobApp, success, errors } = triggerJobExtraction();
  
  if (success) {
    // Populate the form with extracted data
    setNewJobApp(prev => ({
      ...prev,
      ...jobApp,
      id: prev.id, // Keep existing ID if any
    }));
    
    // Pre-populate skills input if skills were extracted
    if (jobApp.skills?.length) {
      setSkillInput(jobApp.skills.join(', '));
    }
  } else {
    // Show errors to user or log them
    console.log('Could not extract all data:', errors);
  }
};
```

## Adding New Job Sites

To add support for a new job site:

1. **Create a new rule file**: Copy `rules/template.ts` and rename it (e.g., `rules/workday.ts`)
2. **Define the rules**: Update domain, displayName, selectors, and field mappings
3. **Import the rules**: Add your rule import to `extractionRules.ts`
4. **Test thoroughly**: Verify selectors work on multiple job postings

The new rules will be automatically included in the extraction process, and the displayName will be used for site identification.

Example new rule file:

```typescript
// rules/workday.ts
import { ExtractionRuleSet } from '../types';

export const workdayRules: ExtractionRuleSet = {
  domain: 'myworkdayjobs.com',
  displayName: 'Workday',
  rules: [
    {
      field: 'jobTitle',
      selector: '[data-automation-id="jobPostingHeader"]',
      attribute: 'textContent'
    },
    // ... more rules
  ]
};
```

Then add to `extractionRules.ts`:
```typescript
import { workdayRules } from './rules/workday';
// Add workdayRules to the extractionRules array
```

## Field Extraction Rules

Each field can be extracted using:
- **selector**: CSS selector to find the element
- **attribute**: What to extract ('textContent', 'innerText', 'href', 'value', or any attribute name)
- **transform**: Optional function to modify the extracted value

## Error Handling

The service is designed to be resilient:
- If a selector fails, it logs an error but continues
- Missing fields result in empty/undefined values in the JobApp object
- The user can always review and edit the extracted data before saving

## Debugging

Enable console logging to see extraction progress:
1. Open browser DevTools
2. Look for extraction logs in the console
3. Check which fields were successfully extracted
4. See any selector errors or missing elements

## Future Enhancements

Potential improvements:
- Machine learning-based extraction as fallback
- Better skill extraction from job descriptions
- Salary range parsing and normalization
- Date parsing for application deadlines
- Company logo/favicon extraction
- Automatic duplicate detection
