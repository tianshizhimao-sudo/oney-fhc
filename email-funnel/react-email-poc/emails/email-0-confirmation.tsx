import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailShell } from './components/EmailShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { defaultSourceFacts, type SharedEmailProps } from '../lib/sourceFacts';

export interface ConfirmationEmailProps extends SharedEmailProps {
  submittedAt: string;
}

export default function ConfirmationEmail({
  firstName,
  productName,
  submittedAt,
  sourceFacts,
  consent,
}: ConfirmationEmailProps) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return (
    <EmailShell preview={`You’re all set — ${productName} confirmation received`}>
      <Header title="You’re on the list" />
      <Section className="px-32 py-28">
        <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">{greeting}</Text>
        <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">
          Thanks — we’ve received your {productName === 'FHC' ? 'FHC registration' : 'Rate Recheck request'} at{' '}
          {submittedAt}. This confirms your details are in, not that any approval or eligibility decision has been made.
        </Text>
        <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">
          Here’s what happens next: we’ll send a short explainer on why approval confidence can change, a checklist to
          prepare for a broker or lender conversation, and a reminder to recheck before relying on old numbers.
        </Text>
        <Section className="rounded-[14px] border border-solid border-[#E6E8EF] bg-[#F8FAFC] px-20 py-18">
          <Text className="m-0 mb-10 text-[13px] font-bold uppercase tracking-[0.6px] text-[#6B4C9A]">
            What this is and isn’t
          </Text>
          <Text className="m-0 text-[14px] leading-[21px] text-[#202437]">
            This is general information to help you prepare. It is not credit advice, not a loan recommendation, and not
            a promise of approval or a borrowing amount.
          </Text>
        </Section>
      </Section>
      <Footer sourceFacts={sourceFacts} consent={consent} isTransactional showSources={false} />
    </EmailShell>
  );
}

ConfirmationEmail.PreviewProps = {
  email: 'alex@example.com',
  firstName: 'Alex',
  productName: 'Rate Recheck',
  productSource: 'rate_recheck',
  submittedAt: '2026-08-05 17:30 AEST',
  sourceFacts: defaultSourceFacts,
  consent: {
    consentType: 'express',
    consentCapturedAt: '2026-08-05',
    consentCaptureMethod: 'form',
    consentCaptureSource: 'rate_recheck',
    managePreferencesUrl: 'https://oneyco.com.au/preferences/example',
    unsubscribeUrl: 'https://oneyco.com.au/unsubscribe/example',
  },
} satisfies ConfirmationEmailProps;

export { ConfirmationEmail };
