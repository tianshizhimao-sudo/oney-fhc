import * as React from 'react';
import { Button, Heading, Section, Text } from '@react-email/components';
import { EmailShell } from './components/EmailShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { defaultSourceFacts, type SharedEmailProps } from '../lib/sourceFacts';

export interface BrokerPrepEmailProps extends SharedEmailProps {
  checklistUrl: string;
}

export default function BrokerPrepEmail({ firstName, checklistUrl, sourceFacts, consent }: BrokerPrepEmailProps) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return (
    <EmailShell preview="What to prepare before relying on a pre-approval.">
      <Header title="What to bring before you rely on a pre-approval" />
      <Section className="px-32 py-28">
        <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">{greeting}</Text>
        <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">
          A useful broker or lender review needs current facts, not just the old approval letter. Before you rely on a
          number, pull together the evidence that can change the answer.
        </Text>
        <Heading as="h2" className="mb-12 mt-20 text-[20px] leading-[26px] text-[#202437]">Broker conversation prep</Heading>
        <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Current income and employment evidence</Text>
        <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Living expenses and existing debts, including credit card limits</Text>
        <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Deposit, genuine savings history, and target purchase range</Text>
        <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Old approval date, lender, conditions, and any changes since approval</Text>
        <Text className="m-0 mb-20 text-[15px] leading-[23px] text-[#202437]">• Any contract timing, auction date, or settlement pressure</Text>
        <Section className="rounded-[14px] border border-solid border-[#E6E8EF] bg-[#F8FAFC] px-20 py-18">
          <Text className="m-0 text-[14px] leading-[21px] text-[#202437]">
            The goal is not to chase the biggest number. The goal is to understand whether your current position, lender policy and buffer still support the decision you are about to make.
          </Text>
        </Section>
        <Button href={checklistUrl} className="mt-22 box-border rounded-[10px] bg-[#2ECC85] px-22 py-13 text-center text-[15px] font-bold text-[#1A1A2E] no-underline">
          Open the prep checklist
        </Button>
      </Section>
      <Footer sourceFacts={sourceFacts} consent={consent} />
    </EmailShell>
  );
}

BrokerPrepEmail.PreviewProps = {
  email: 'alex@example.com',
  firstName: 'Alex',
  productName: 'Rate Recheck',
  productSource: 'rate_recheck',
  checklistUrl: 'https://tools.oneyco.com.au/rate-recheck.html',
  sourceFacts: defaultSourceFacts,
  consent: {
    consentType: 'express',
    consentCapturedAt: '2026-08-05',
    managePreferencesUrl: 'https://oneyco.com.au/preferences/example',
    unsubscribeUrl: 'https://oneyco.com.au/unsubscribe/example',
  },
} satisfies BrokerPrepEmailProps;

export { BrokerPrepEmail };
