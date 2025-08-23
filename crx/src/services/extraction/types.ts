export interface ExtractionRule {
  field: keyof JobAppExtractionFields;
  selector: string;
  attribute?: string; // e.g., 'textContent', 'innerText', 'href', 'value'
  transform?: (value: string) => any; // Optional transformation function
}

export interface ExtractionRuleSet {
  domain: string;
  displayName: string; // Human-readable name for the job site
  urlPattern?: RegExp; // Optional regex pattern for more specific URL matching
  rules: ExtractionRule[];
}

export interface JobAppExtractionFields {
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  source: string;
  skills: string[];
}

export interface ExtractionResult {
  success: boolean;
  data: Partial<JobAppExtractionFields>;
  errors: ExtractionError[];
}

export interface ExtractionError {
  field: string;
  selector: string;
  message: string;
}
