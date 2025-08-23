# Extraction Rules

This directory contains individual extraction rule files for different job sites. Each file defines CSS selectors and extraction logic for a specific job board or company career page.

## Structure

- `template.ts` - Template for creating new rule sets
- `[site-name].ts` - Individual rule files for each job site

## Current Supported Sites

- **LinkedIn** (`linkedin.ts`) - LinkedIn Jobs
- **Indeed** (`indeed.ts`) - Indeed job postings
- **Glassdoor** (`glassdoor.ts`) - Glassdoor job listings
- **Lever** (`lever.ts`) - Lever-powered career pages
- **Greenhouse** (`greenhouse.ts`) - Greenhouse-powered career pages

## Adding a New Job Site

1. **Copy the template**: Start with `template.ts` as your base
2. **Rename the file**: Use the job site name (e.g., `workday.ts`)
3. **Update the domain**: Set the correct domain name
4. **Define selectors**: Add CSS selectors for each field
5. **Test selectors**: Verify they work on the target site
6. **Import the rules**: Add your import to `../extractionRules.ts`

All other functionality (site detection, display names) will work automatically.

## Rule Structure

Each rule file exports an `ExtractionRuleSet` with:

```typescript
{
  domain: 'site-name.com',           // Domain to match
  displayName: 'Site Name',          // Human-readable name
  urlPattern: /regex/,               // Optional URL pattern
  rules: [                           // Array of extraction rules
    {
      field: 'jobTitle',             // JobApp field to populate
      selector: '.title-selector',   // CSS selector
      attribute: 'textContent',      // What to extract
      transform: (val) => val        // Optional transformation
    }
  ]
}
```

## Extraction Fields

Available fields to extract:
- `jobTitle` - Job title/position name
- `company` - Company name
- `location` - Job location
- `salary` - Salary or pay range
- `description` - Job description text
- `source` - Source URL (auto-filled)
- `skills` - Skills array (often extracted from description)

## Selector Tips

1. **Use multiple selectors**: Separate with commas for fallbacks
2. **Be specific**: Use data attributes when available
3. **Test thoroughly**: Sites change their HTML frequently
4. **Consider variations**: Different page layouts may need different selectors

## Attributes

Common attribute values:
- `textContent` - Plain text content
- `innerText` - Rendered text (respects display:none)
- `href` - Link URLs
- `value` - Input field values
- `title` - Title attributes
- Any HTML attribute name

## Transform Functions

Use transform functions to:
- Clean up extracted text
- Convert formats (dates, salary ranges)
- Extract specific parts of text
- Combine multiple values

Example:
```typescript
{
  field: 'salary',
  selector: '.pay-range',
  attribute: 'textContent',
  transform: (value: string) => value.replace(/[^\d,-]/g, '')
}
```

## Testing Your Rules

1. Navigate to a job posting on the target site
2. Open browser DevTools
3. Test your CSS selectors in the console:
   ```javascript
   document.querySelector('.your-selector')?.textContent
   ```
4. Verify all fields are extracted correctly
5. Test on multiple job postings from the same site

## Maintenance

- Review rules periodically as sites update their HTML
- Update selectors when extraction fails
- Add new fallback selectors for robustness
- Document any site-specific quirks or limitations
