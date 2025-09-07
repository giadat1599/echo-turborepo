'use client';

import { screenAtom } from '../../atoms/widget-atoms';
import { WidgetScreen } from '../../types';
import { WidgetAuthScreen } from '../screens/widget-auth-screen';
import { useAtomValue } from 'jotai';
import { WidgetErrorScreen } from '../screens/widget-error-screen';
import { WidgetLoadingScreen } from '../screens/widget-loading-screen';
import { WidgetSelectionScreen } from '../screens/widget-selection-screen';
import { WidgetChatScreen } from '../screens/widget-chat-screen';

interface WidgetViewProps {
  organizationId?: string | null;
}

export function WidgetView({ organizationId }: WidgetViewProps) {
  const screen = useAtomValue(screenAtom);

  const screenComponents: Record<WidgetScreen, React.ReactNode> = {
    error: <WidgetErrorScreen />,
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    auth: <WidgetAuthScreen />,
    voice: <p>TODO: voice</p>,
    inbox: <p>TODO: inbox</p>,
    selection: <WidgetSelectionScreen />,
    chat: <WidgetChatScreen />,
    contact: <p>TODO: contact</p>,
  };
  return (
    <main className="min-h-screen min-w-screen flex size-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]}
    </main>
  );
}
