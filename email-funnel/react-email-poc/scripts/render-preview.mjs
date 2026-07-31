import React from 'react';
import { render } from '@react-email/render';
import Email, { BorrowingConfidenceEmail } from '../emails/rate-recheck-borrowing-confidence.tsx';

const props = Email.PreviewProps;
const html = await render(React.createElement(BorrowingConfidenceEmail, props));
const text = await render(React.createElement(BorrowingConfidenceEmail, props), { plainText: true });

if (!html.includes('Your rate didn')) throw new Error('HTML render missing headline');
if (!text.toLowerCase().includes('general information only')) throw new Error('Plain text missing disclaimer');
if (!text.toLowerCase().includes('unsubscribe')) throw new Error('Plain text missing unsubscribe');
console.log(`render passed: html=${html.length} chars text=${text.length} chars`);
