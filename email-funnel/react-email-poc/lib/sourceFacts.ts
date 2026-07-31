export type ProductName = 'FHC' | 'Rate Recheck';

export interface SourceFacts {
  rbaCashRate: string;
  rbaEffectiveDate: string;
  rbaSourceDate: string;
  rbaSourceUrl: string;
  apraBuffer: string;
  apraSourceDate: string;
  apraSourceUrl: string;
}

export const defaultSourceFacts: SourceFacts = {
  rbaCashRate: '4.35%',
  rbaEffectiveDate: '2026-06-17',
  rbaSourceDate: '2026-07-31',
  rbaSourceUrl: 'https://www.rba.gov.au/statistics/cash-rate/',
  apraBuffer: '3 percentage points',
  apraSourceDate: '2026-07-31',
  apraSourceUrl: 'https://www.apra.gov.au/news-and-publications/apra-announces-update-macroprudential-settings',
};
