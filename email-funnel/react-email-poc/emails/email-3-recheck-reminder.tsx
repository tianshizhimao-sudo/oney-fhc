import * as React from 'react';
import { Button, Heading, Section, Text } from '@react-email/components';
import { EmailShell } from './components/EmailShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { defaultSourceFacts, type SharedEmailProps } from '../lib/sourceFacts';

export interface RecheckReminderEmailProps extends SharedEmailProps {
  approvalAgeDays?: number;
  materialChange?: boolean;
  recheckUrl: string;
}

export default function RecheckReminderEmail({
  firstName,
  approvalAgeDays,
  materialChange,
  recheckUrl,
  sourceFacts,
  consent,
}: RecheckReminderEmailProps) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const ageText = approvalAgeDays ? `Your approval is about ${approvalAgeDays} days old.` : 'Your approval date was not provided.';
  return (
    <EmailShell preview="Quick check: is your approval still fresh?">
      <Header title="Quick check: is your approval still fresh?" />
      <Section className="px-32 py-28">
        <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">{greeting}</Text>
        <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">
          This is your requested recheck reminder. {ageText} If anything material has changed, it is worth confirming the numbers before relying on them.
        </Text>
        <Heading as="h2" className="mb-12 mt-20 text-[20px] leading-[26px] text-[#202437]">Recheck is sensible if:</Heading>
        <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Approval age is more than 60–90 days</Text>
        <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Income, debts, expenses, deposit or property price changed</Text>
        <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• You are moving closer to your maximum purchase ceiling</Text>
        <Text className="m-0 mb-20 text-[15px] leading-[23px] text-[#202437]">• You are close to signing a contract or bidding at auction</Text>
        {materialChange && (
          <Section className="rounded-[14px] border border-solid border-[#E6E8EF] bg-[#F8FAFC] px-20 py-18">
            <Text className="m-0 text-[14px] leading-[21px] text-[#202437]">
              You previously indicated a material change. Treat the old number as a starting point, not a decision-ready figure.
            </Text>
          </Section>
        )}
        <Button href={recheckUrl} className="mt-22 box-border rounded-[10px] bg-[#2ECC85] px-22 py-13 text-center text-[15px] font-bold text-[#1A1A2E] no-underline">
          Run a fresh recheck
        </Button>
      </Section>
      <Footer sourceFacts={sourceFacts} consent={consent} />
    </EmailShell>
  );
}

RecheckReminderEmail.PreviewProps = {
  email: 'alex@example.com',
  firstName: 'Alex',
  productName: 'Rate Recheck',
  productSource: 'rate_recheck',
  approvalAgeDays: 82,
  materialChange: true,
  recheckUrl: 'https://tools.oneyco.com.au/rate-recheck.html',
  sourceFacts: defaultSourceFacts,
  consent: {
    consentType: 'express',
    consentCapturedAt: '2026-08-05',
    managePreferencesUrl: 'https://oneyco.com.au/preferences/example',
    unsubscribeUrl: 'https://oneyco.com.au/unsubscribe/example',
  },
} satisfies RecheckReminderEmailProps;

export { RecheckReminderEmail };
