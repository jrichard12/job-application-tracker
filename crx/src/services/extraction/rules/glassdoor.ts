import { ExtractionRuleSet } from '../types';

export const glassdoorRules: ExtractionRuleSet = {
  domain: 'glassdoor.ca',
  displayName: 'Glassdoor',
  rules: [
    {
      field: 'jobTitle',
      selector: '[id^="jd-job-title-"]',
      attribute: 'textContent'
    },
    {
      field: 'company',
      selector: '[class^="EmployerProfile_employerNameHeading"]',
      attribute: 'textContent'
    },
    {
      field: 'location',
      selector: '[data-test="location"]',
      attribute: 'textContent'
    },
    {
      field: 'salary',
      selector: '[class^="SalaryEstimate_salaryRange"]',
      attribute: 'textContent'
    },
    {
      field: 'description',
      selector: '[class^="JobDetails_jobDescription"]',
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
