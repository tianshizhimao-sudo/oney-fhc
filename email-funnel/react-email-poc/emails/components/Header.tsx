import * as React from 'react';
import { Heading, Section, Text } from '@react-email/components';
import { brand } from './brand';

interface HeaderProps {
  eyebrow?: string;
  title: string;
}

export function Header({ eyebrow = 'ONEY & CO', title }: HeaderProps) {
  return (
    <Section className="bg-[#1A1A2E] px-32 py-28">
      <Text className="m-0 text-[14px] font-bold tracking-[1px] text-[#2ECC85]">{eyebrow}</Text>
      <Heading className="mb-0 mt-16 text-[28px] leading-[34px] text-white">{title}</Heading>
    </Section>
  );
}
