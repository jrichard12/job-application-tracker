import { ExtractionRuleSet } from '../types';

export const simplyhiredRules: ExtractionRuleSet = {
  domain: 'simplyhired.ca',
  displayName: 'Simply Hired', 
  rules: [
    {
      field: 'jobTitle',
      selector: '[data-testid^="viewJobTitle"]',
      attribute: 'textContent'
    },
    {
      field: 'company',
      selector: '[data-testid^="viewJobCompanyName"] [data-testid^="detailText"]',
      attribute: 'textContent'
    },
    {
      field: 'location',
      selector: '[data-testid^="viewJobCompanyLocation"] [data-testid^="detailText"]',
      attribute: 'textContent'
    },
    {
      field: 'salary',
      selector: '[data-testid^="viewJobBodyJobCompensation"] [data-testid^="detailText"]',
      attribute: 'textContent'
    },
    {
      field: 'description',
      selector: '[data-testid^="viewJobBodyJobFullDescriptionContent"]',
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
