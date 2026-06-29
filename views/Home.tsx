// views/Home.tsx
import { Hero } from '@/components/Hero';
import { FeatureCards } from '@/components/FeatureCards';
import { CoreValues } from '@/components/ValueProp';
import { Page } from '@/layout/Page';

export default function Home() {
  return (
    <Page>
      <Hero />
      <FeatureCards />
      <CoreValues />
    </Page>
  );
}
