// Source facts are defined ONCE here so RBA/APRA values are never buried
// in template copy. Before any live send, re-verify against the official
// source pages below and update these values + source dates together.
//
// RBA and APRA official sources (checked 2026-10-29):
//   RBA  - https://www.rba.gov.au/statistics/cash-rate/
//   APRA - https://www.apra.gov.au/news-and-publications/apra-maintains-current-macroprudential-policy-settings-highly-uncertain

export type ProductName = 'FHC' | 'Rate Recheck';

export type ProductSource = 'fhc' | 'rate_recheck' | 'bank_ready_score';
export type ConsentType = 'express' | 'inferred' | 'transactional_only';

export interface SourceFacts {
  rbaCashRate: string;
  rbaEffectiveDate: string;
  rbaSourceDate: string;
  rbaSourceUrl: string;
  apraBuffer: string;
  apraSourceDate: string;
  apraSourceUrl: string;
  /** Stable audit marker stored with rendered/sent emails. */
  sourceFactVersion: string;
}

export const defaultSourceFacts: SourceFacts = {
  rbaCashRate: '4.60%',
  rbaEffectiveDate: '30 September 2026',
  rbaSourceDate: '2026-10-29',
  rbaSourceUrl: 'https://www.rba.gov.au/statistics/cash-rate/',
  apraBuffer: '3 percentage points',
  apraSourceDate: '2026-10-29',
  apraSourceUrl: 'https://www.apra.gov.au/news-and-publications/apra-maintains-current-macroprudential-policy-settings-highly-uncertain',
  sourceFactVersion: 'rba-2026-10-29__apra-buffer-2026-10-29',
};

// Consent + preference fields shared by every template. Kept separate from
// SourceFacts so templates stay source-fresh while consent metadata stays
// schema-stable for downstream lead / preference management.
export interface ConsentMeta {
  consentType: ConsentType;
  consentCapturedAt?: string;
  consentCaptureMethod: 'form' | 'phone' | 'face_to_face' | 'import' | 'manual_review';
  consentCaptureSource: ProductSource;
  managePreferencesUrl: string;
  unsubscribeUrl: string;
}

export interface SharedEmailProps {
  email: string;
  firstName?: string;
  productName: ProductName;
  productSource?: ProductSource;
  sourceFacts: SourceFacts;
  consent: ConsentMeta;
}
