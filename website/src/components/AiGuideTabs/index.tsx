import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import rawJa from '@miniviz-public/llms-full.ja.txt';
import rawEn from '@miniviz-public/llms-full.txt';

type Props = {
  /** Which tab is selected first — set from each locale’s intro page */
  defaultTab?: 'ja' | 'en';
};

export default function AiGuideTabs({
  defaultTab = 'en',
}: Props): React.ReactElement {
  return (
    <Tabs defaultValue={defaultTab}>
      <TabItem value="ja" label="日本語">
        <CodeBlock language="text" className="ai-guide-pre">
          {String(rawJa)}
        </CodeBlock>
      </TabItem>
      <TabItem value="en" label="English">
        <CodeBlock language="text" className="ai-guide-pre">
          {String(rawEn)}
        </CodeBlock>
      </TabItem>
    </Tabs>
  );
}
