import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  pixelBasedPreset,
} from '@react-email/components';
import { brand } from './brand';

interface EmailShellProps {
  preview: string;
  children: React.ReactNode;
}

// Shared document shell + Tailwind config. Emails stay focused on copy/CTA,
// the brand + email-client-safe layout lives here.
export function EmailShell({ preview, children }: EmailShellProps) {
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
        <Preview>{preview}</Preview>
        <Body className="m-0 bg-[#F5F7FB] px-0 py-32 font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden rounded-[18px] bg-white">{children}</Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
