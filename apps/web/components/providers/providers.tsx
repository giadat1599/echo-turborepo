import { ClerkProvider } from '@clerk/nextjs';
import { ConvexProvider } from './convex-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProvider>{children}</ConvexProvider>;
    </ClerkProvider>
  );
}
