import { ExtractionRuleSet } from '../types';

export const indeedRules: ExtractionRuleSet = {
  domain: 'indeed.com',
  displayName: 'Indeed',
  rules: [
    {
      field: 'jobTitle',
      selector: '[data-testid^="jobsearch-JobInfoHeader-title"]',
      attribute: 'textContent',
      transform: (value: string) => value.replace(/\s*-\s*job post\s*$/, '').trim()
    },
    {
      field: 'company',
      selector: '[data-testid="inlineHeader-companyName"] a',
      attribute: 'textContent'
    },
    {
      field: 'location',
      selector: '[data-testid^="inlineHeader-companyLocation"]',
      attribute: 'textContent'
    },
    {
      field: 'salary',
      selector: '[id^="salaryInfoAndJobType"]',
      attribute: 'textContent'
    },
    {
      field: 'description',
      selector: '[id^="jobDescriptionText"]',
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
