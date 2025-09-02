'use client';

import { WidgetAuthScreen } from '../screens/widget-auth-screen';

interface WidgetViewProps {
  organizationId: string;
}

export function WidgetView({ organizationId }: WidgetViewProps) {
  return (
    <main className="min-h-screen min-w-screen flex size-full flex-col overflow-hidden rounded-xl border bg-muted">
      <WidgetAuthScreen />
      {/* <WidgetFooter /> */}
    </main>
  );
}
