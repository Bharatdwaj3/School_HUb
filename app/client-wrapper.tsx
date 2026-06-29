// app/client-wrapper.tsx
'use client';

import { StoreProvider } from '@/store/StoreProvider';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  );
}