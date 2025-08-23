import { ExtractionRuleSet } from '../types';

export const leverRules: ExtractionRuleSet = {
  domain: 'jobs.lever.co',
  displayName: 'Lever',
  rules: [
    {
      field: 'jobTitle',
      selector: '.posting-headline h2',
      attribute: 'textContent'
    },
    {
      field: 'company',
      selector: '.main-header-text a',
      attribute: 'textContent'
    },
    {
      field: 'location',
      selector: '.posting-headline .sort-by-location',
      attribute: 'textContent'
    },
    {
      field: 'description',
      selector: '.content .posting-description',
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
