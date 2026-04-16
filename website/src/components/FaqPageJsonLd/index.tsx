import React from 'react';
import Head from '@docusaurus/Head';

type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  items: FaqItem[];
};

export default function FaqPageJsonLd({items}: Props): React.ReactElement | null {
  if (!items.length) {
    return null;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Head>
  );
}
