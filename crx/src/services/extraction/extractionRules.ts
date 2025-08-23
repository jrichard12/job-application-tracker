import { ExtractionRuleSet } from './types';
import { linkedinRules } from './rules/linkedin';
import { indeedRules } from './rules/indeed';
import { glassdoorRules } from './rules/glassdoor';
import { leverRules } from './rules/lever';
import { greenhouseRules } from './rules/greenhouse';

// Collection of all extraction rules from individual rule files
export const extractionRules: ExtractionRuleSet[] = [
  linkedinRules,
  indeedRules,
  glassdoorRules,
  leverRules,
  greenhouseRules
];

export function getRulesForUrl(url: string): ExtractionRuleSet | null {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    console.log('🔍 getRulesForUrl - Input URL:', url);
    console.log('🔍 getRulesForUrl - Parsed domain:', domain);
    console.log('🔍 getRulesForUrl - Available rule domains:', extractionRules.map(r => r.domain));
    
    for (const ruleSet of extractionRules) {
      console.log(`🔍 Checking rule for domain: ${ruleSet.domain} against parsed domain: ${domain}`);
      
      // More robust domain matching - check if domains match exactly or if parsed domain ends with rule domain
      const domainMatches = domain === ruleSet.domain || 
                           domain.endsWith('.' + ruleSet.domain) || 
                           domain.includes(ruleSet.domain);
      
      if (domainMatches) {
        console.log(`✅ Domain match found for: ${ruleSet.domain}`);
        
        // If there's a URL pattern, check if it matches
        if (ruleSet.urlPattern) {
          console.log(`🔍 Checking URL pattern: ${ruleSet.urlPattern} against URL: ${url}`);
          if (ruleSet.urlPattern.test(url)) {
            console.log(`✅ URL pattern match found for: ${ruleSet.domain}`);
            return ruleSet;
          } else {
            console.log(`❌ URL pattern did not match for: ${ruleSet.domain}`);
          }
        } else {
          // No specific URL pattern, domain match is enough
          console.log(`✅ No URL pattern required, returning rules for: ${ruleSet.domain}`);
          return ruleSet;
        }
      } else {
        console.log(`❌ Domain ${domain} does not match ${ruleSet.domain}`);
      }
    }
    
    console.log('❌ No matching rules found for URL:', url);
    return null;
  } catch (error) {
    console.error('Error parsing URL for extraction rules:', error);
    return null;
  }
}
