'use client';

import { screenAtom } from '../../atoms/widget-atoms';
import { WidgetScreen } from '../../types';
import { WidgetAuthScreen } from '../screens/widget-auth-screen';
import { useAtomValue } from 'jotai';

interface WidgetViewProps {
  organizationId: string;
}

export function WidgetView({ organizationId }: WidgetViewProps) {
  const screen = useAtomValue(screenAtom);

  const screenComponents: Record<WidgetScreen, React.ReactNode> = {
    error: <p>TODO</p>,
    loading: <p>TODO: loading</p>,
    auth: <WidgetAuthScreen />,
    voice: <p>TODO: voice</p>,
    inbox: <p>TODO: inbox</p>,
    selection: <p>TODO: selection</p>,
    chat: <p>TODO: chat</p>,
    contact: <p>TODO: contact</p>,
  };
  return (
    <main className="min-h-screen min-w-screen flex size-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]}
    </main>
  );
}
