import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from '@react-email/components';
import { defaultSourceFacts, ProductName, SourceFacts } from '../lib/sourceFacts';

interface BorrowingConfidenceEmailProps {
  firstName?: string;
  productName: ProductName;
  recheckUrl: string;
  managePreferencesUrl: string;
  unsubscribeUrl: string;
  sourceFacts: SourceFacts;
}

const brand = {
  green: '#2ECC85',
  greenDark: '#1FAD73',
  purple: '#6B4C9A',
  navy: '#1A1A2E',
  card: '#FFFFFF',
  text: '#202437',
  muted: '#667085',
  border: '#E6E8EF',
};

export default function BorrowingConfidenceEmail({
  firstName,
  productName,
  recheckUrl,
  managePreferencesUrl,
  unsubscribeUrl,
  sourceFacts,
}: BorrowingConfidenceEmailProps) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';

  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                oneyGreen: brand.green,
                oneyGreenDark: brand.greenDark,
                oneyPurple: brand.purple,
                oneyNavy: brand.navy,
              },
            },
          },
        }}
      >
        <Head />
        <Preview>Your rate may be unchanged, but your approval could still be stale.</Preview>
        <Body className="m-0 bg-[#F5F7FB] px-0 py-32 font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden rounded-[18px] bg-white">
            <Section className="bg-[#1A1A2E] px-32 py-28">
              <Text className="m-0 text-[14px] font-bold tracking-[1px] text-[#2ECC85]">ONEY & CO</Text>
              <Heading className="mb-0 mt-16 text-[28px] leading-[34px] text-white">
                Your rate didn’t change. Your approval might have.
              </Heading>
            </Section>

            <Section className="px-32 py-28">
              <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">{greeting}</Text>
              <Text className="m-0 mb-16 text-[16px] leading-[24px] text-[#202437]">
                A pre-approval is not a permanent borrowing limit. Even when headline rates look stable,
                the answer can change if your income, expenses, debts, deposit, lender policy, or DTI position has moved.
              </Text>
              <Text className="m-0 mb-20 text-[16px] leading-[24px] text-[#202437]">
                That is why {productName} treats old approval numbers as something to recheck before you rely on them — especially before signing a contract or changing your purchase range.
              </Text>

              <Section className="rounded-[14px] border border-solid border-[#E6E8EF] bg-[#F8FAFC] px-20 py-18">
                <Text className="m-0 mb-10 text-[14px] font-bold uppercase tracking-[0.6px] text-[#6B4C9A]">
                  Quick source check
                </Text>
                <Text className="m-0 mb-8 text-[14px] leading-[21px] text-[#202437]">
                  RBA cash rate target: {sourceFacts.rbaCashRate}, effective {sourceFacts.rbaEffectiveDate}.
                </Text>
                <Text className="m-0 text-[14px] leading-[21px] text-[#202437]">
                  APRA serviceability buffer: {sourceFacts.apraBuffer}. These are source facts, not a promise of approval or borrowing capacity.
                </Text>
              </Section>

              <Heading as="h2" className="mb-12 mt-24 text-[20px] leading-[26px] text-[#202437]">
                Recheck if any of these changed
              </Heading>
              <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Your income, employment type, or bonus/overtime pattern</Text>
              <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Credit card limits, personal loans, HECS/HELP, or other debts</Text>
              <Text className="m-0 mb-6 text-[15px] leading-[23px] text-[#202437]">• Living expenses, dependants, deposit, or target purchase price</Text>
              <Text className="m-0 mb-22 text-[15px] leading-[23px] text-[#202437]">• The approval is more than 60–90 days old, or lender policy has changed</Text>

              <Button
                href={recheckUrl}
                className="box-border rounded-[10px] bg-[#2ECC85] px-22 py-13 text-center text-[15px] font-bold text-[#1A1A2E] no-underline"
              >
                Recheck your numbers
              </Button>

              <Hr className="my-26 border-[#E6E8EF]" />

              <Text className="m-0 mb-12 text-[13px] leading-[20px] text-[#667085]">
                General information only — not credit advice, tax advice, or a loan recommendation. Before relying on any borrowing figure, speak with a broker or lender who can review your full circumstances.
              </Text>
              <Text className="m-0 text-[12px] leading-[19px] text-[#667085]">
                Sources checked: RBA ({sourceFacts.rbaSourceDate}) and APRA ({sourceFacts.apraSourceDate}). Manage your email preferences <Link href={managePreferencesUrl} className="text-[#1FAD73]">here</Link> or <Link href={unsubscribeUrl} className="text-[#1FAD73]">unsubscribe</Link>.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

BorrowingConfidenceEmail.PreviewProps = {
  firstName: 'Alex',
  productName: 'Rate Recheck',
  recheckUrl: 'https://tools.oneyco.com.au/rate-recheck.html',
  managePreferencesUrl: 'https://oneyco.com.au/preferences/example',
  unsubscribeUrl: 'https://oneyco.com.au/unsubscribe/example',
  sourceFacts: defaultSourceFacts,
} satisfies BorrowingConfidenceEmailProps;

export { BorrowingConfidenceEmail };
