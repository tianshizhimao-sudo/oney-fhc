import * as React from 'react';
import { Button, Section, Text, Heading } from '@react-email/components';
import { EmailShell } from './components/EmailShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { defaultSourceFacts, type SharedEmailProps } from '../lib/sourceFacts';

export interface BorrowingConfidenceEmailProps extends SharedEmailProps {
  recheckUrl: string;
}

export default function BorrowingConfidenceEmail({
  firstName,
  productName,
  recheckUrl,
  sourceFacts,
  consent,
}: BorrowingConfidenceEmailProps) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return (
    <EmailShell preview="Your rate may be unchanged, but your approval could still be stale.">
      <Header title="Your rate didn’t change. Your approval might have." />
      <Section className="px-32 py-28">
        <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">{greeting}</Text>
        <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">
          A pre-approval is not a permanent borrowing limit. Even when headline rates look stable, the answer can change
          if your income, expenses, debts, deposit, lender policy, or DTI position has moved.
        </Text>
        <Text className="m-0 mb-20 text-[16px] leading-[24px] text-[#202437]">
          That is why {productName} treats old approval numbers as something to recheck before you rely on them —
          especially before signing a contract or changing your purchase range.
        </Text>
        <Section className="rounded-[14px] border border-solid border-[#E6E8EF] bg-[#F8FAFC] px-20 py-18">
          <Text className="m-0 mb-10 text-[14px] font-bold uppercase tracking-[0.6px] text-[#6B4C9A]">Quick source check</Text>
          <Text className="m-0 mb-8 text-[14px] leading-[21px] text-[#202437]">
            RBA cash rate target: {sourceFacts.rbaCashRate}, effective {sourceFacts.rbaEffectiveDate}.
          </Text>
          <Text className="m-0 text-[14px] leading-[21px] text-[#202437]">
            APRA serviceability buffer: {sourceFacts.apraBuffer}. These are source facts, not a promise of approval or borrowing capacity.
          </Text>
        </Section>
        <Heading as="h2" className="mb-12 mt-24 text-[20px] leading-[26px] text-[#202437]">Recheck if any of these changed</Heading>
        <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Your income, employment type, or bonus/overtime pattern</Text>
        <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Credit card limits, personal loans, HECS/HELP, or other debts</Text>
        <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Living expenses, dependants, deposit, or target purchase price</Text>
        <Text className="m-0 mb-22 text-[15px] leading-[23px] text-[#202437]">• The approval is more than 60–90 days old, or lender policy has changed</Text>
        <Button href={recheckUrl} className="box-border rounded-[10px] bg-[#2ECC85] px-22 py-13 text-center text-[15px] font-bold text-[#1A1A2E] no-underline">
          Recheck your numbers
        </Button>
      </Section>
      <Footer sourceFacts={sourceFacts} consent={consent} />
    </EmailShell>
  );
}

BorrowingConfidenceEmail.PreviewProps = {
  email: 'alex@example.com',
  firstName: 'Alex',
  productName: 'Rate Recheck',
  productSource: 'rate_recheck',
  recheckUrl: 'https://tools.oneyco.com.au/rate-recheck.html',
  sourceFacts: defaultSourceFacts,
  consent: {
    consentType: 'express',
    consentCapturedAt: '2026-08-05',
    managePreferencesUrl: 'https://oneyco.com.au/preferences/example',
    unsubscribeUrl: 'https://oneyco.com.au/unsubscribe/example',
  },
} satisfies BorrowingConfidenceEmailProps;

export { BorrowingConfidenceEmail };
