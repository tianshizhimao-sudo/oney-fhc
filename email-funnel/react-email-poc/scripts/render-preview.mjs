import React from 'react';
import { render } from '@react-email/render';

const templates = [
  ['email-0-confirmation', await import('../emails/email-0-confirmation.tsx')],
  ['rate-recheck-borrowing-confidence', await import('../emails/rate-recheck-borrowing-confidence.tsx')],
  ['email-2-broker-prep', await import('../emails/email-2-broker-prep.tsx')],
  ['email-3-recheck-reminder', await import('../emails/email-3-recheck-reminder.tsx')],
];

for (const [name, mod] of templates) {
  const Component = mod.default;
  const props = Component.PreviewProps;
  const html = await render(React.createElement(Component, props));
  const text = await render(React.createElement(Component, props), { plainText: true });
  if (!html || html.length < 1000) throw new Error(`${name}: HTML render too short`);
  if (!text || text.length < 300) throw new Error(`${name}: plain text render too short`);
  if (!text.toLowerCase().includes('general information only')) throw new Error(`${name}: plain text missing disclaimer`);
  if (!text.toLowerCase().includes('credit advice')) throw new Error(`${name}: plain text missing credit advice boundary`);
  if (name !== 'email-0-confirmation' && !text.toLowerCase().includes('unsubscribe')) throw new Error(`${name}: plain text missing unsubscribe`);
  console.log(`render passed: ${name} html=${html.length} chars text=${text.length} chars`);
}
