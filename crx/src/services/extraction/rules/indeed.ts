import { ExtractionRuleSet } from '../types';

export const indeedRules: ExtractionRuleSet = {
  domain: 'indeed.com',
  displayName: 'Indeed',
  rules: [
    {
      field: 'jobTitle',
      selector: '[data-testid="jobsearch-JobInfoHeader-title"] h1, .jobsearch-JobInfoHeader-title',
      attribute: 'textContent'
    },
    {
      field: 'company',
      selector: '[data-testid="inlineHeader-companyName"] a, .jobsearch-InlineCompanyRating',
      attribute: 'textContent'
    },
    {
      field: 'location',
      selector: '[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle',
      attribute: 'textContent'
    },
    {
      field: 'salary',
      selector: '[data-testid="job-salary"], .jobsearch-JobMetadataHeader-item',
      attribute: 'textContent'
    },
    {
      field: 'description',
      selector: '#jobDescriptionText, .jobsearch-jobDescriptionText',
      attribute: 'textContent'
    },
    {
      field: 'source',
      selector: '',
      attribute: '',
      transform: () => window.location.href
    }
  ]
};
