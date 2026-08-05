import * as React from 'react';
import { Hr, Link, Section, Text } from '@react-email/components';
import { brand } from './brand';
import type { ConsentMeta, SourceFacts } from '../../lib/sourceFacts';

// Command footer for every template.
// - General information only / not credit advice (NCCP + best-interests boundary).
// - Live source facts so RBA/APRA values are never hard-coded in copy.
// - Consent-aware preference management + unsubscribe (required where commercial
//   content is present). Only rendered with a real href for marketing emails.
interface FooterProps {
  sourceFacts: SourceFacts;
  consent: ConsentMeta;
  isTransactional?: boolean;
  showSources?: boolean;
}

export function Footer({ sourceFacts, consent, isTransactional = false, showSources = true }: FooterProps) {
  return (
    <Section className="px-32 py-24">
      <Hr className="my-20 border-[#E6E8EF]" />
      <Text className="m-0 mb-12 text-[13px] leading-[20px] text-[#667085]">
        General information only — not credit advice, tax advice, or a loan recommendation. Nothing here is an approval,
        eligibility guarantee, or promise of a particular borrowing amount or “best loan”. Before relying on any borrowing
        figure, speak with a broker or lender who can review your full circumstances.
      </Text>

      {showSources && (
        <Text className="m-0 mb-12 text-[13px] leading-[20px] text-[#667085]">
          Sources checked: RBA cash rate target {sourceFacts.rbaCashRate} (effective {sourceFacts.rbaEffectiveDate}),
          APRA serviceability buffer of {sourceFacts.apraBuffer}. Source-checked {sourceFacts.rbaSourceDate}. These are
          facts, not a promise of approval or borrowing capacity.
        </Text>
      )}

      {isTransactional ? (
        <Text className="m-0 text-[12px] leading-[19px] text-[#667085]">
          You are receiving this because you submitted this form. Manage your email preferences{' '}
          <Link href={consent.managePreferencesUrl} className="text-[#1FAD73]">
            here
          </Link>
          .
        </Text>
      ) : (
        <Text className="m-0 text-[12px] leading-[19px] text-[#667085]">
          You asked us to stay in touch. Manage your email preferences{' '}
          <Link href={consent.managePreferencesUrl} className="text-[#1FAD73]">
            here
          </Link>{' '}
          or{' '}
          <Link href={consent.unsubscribeUrl} className="text-[#1FAD73]">
            unsubscribe
          </Link>
          . Your consent was captured on {consent.consentCapturedAt ?? 'sign-up'} ({consent.consentType}).
        </Text>
      )}
    </Section>
  );
}
