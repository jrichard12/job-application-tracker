import { ExtractionRuleSet } from '../types';

export const linkedinRules: ExtractionRuleSet = {
  domain: 'linkedin.com',
  displayName: 'LinkedIn',
  urlPattern: /\/jobs\/view\/\d+/,
  rules: [
    {
      field: 'jobTitle',
      selector: '.top-card-layout__title h1',
      attribute: 'textContent'
    },
    {
      field: 'company',
      selector: '.topcard__org-name-link, .sub-nav-cta__optional-url',
      attribute: 'textContent'
    },
    {
      field: 'location',
      selector: '.topcard__flavor--bullet, .top-card-layout__second-subline span',
      attribute: 'textContent'
    },
    {
      field: 'description',
      selector: '.description__text, .show-more-less-html__markup',
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
