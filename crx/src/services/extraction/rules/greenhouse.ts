import { ExtractionRuleSet } from '../types';

export const greenhouseRules: ExtractionRuleSet = {
  domain: 'greenhouse.io',
  displayName: 'Greenhouse',
  rules: [
    {
      field: 'jobTitle',
      selector: '#header h1',
      attribute: 'textContent'
    },
    {
      field: 'company',
      selector: '#header .company-name',
      attribute: 'textContent'
    },
    {
      field: 'location',
      selector: '.location',
      attribute: 'textContent'
    },
    {
      field: 'description',
      selector: '#content .section-wrapper',
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
