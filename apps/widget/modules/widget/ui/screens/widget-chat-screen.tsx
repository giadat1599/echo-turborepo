'use client';

import { Button } from '@workspace/ui/components/button';
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from '../../atoms/widget-atoms';
import { WidgetHeader } from '../components/widget-header';
import { ArrowLeftIcon, MenuIcon } from 'lucide-react';
import { useAtom } from 'jotai';
import { useQuery } from 'convex/react';
import { api } from '@workspace/backend/_generated/api';

export function WidgetChatScreen() {
  const [, setScreen] = useAtom(screenAtom);
  const [conversationId, setConversationId] = useAtom(conversationIdAtom);
  const [organizationId] = useAtom(organizationIdAtom);
  const [contactSessionId] = useAtom(
    contactSessionIdAtomFamily(organizationId || '')
  );

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        }
      : 'skip'
  );

  const handleBack = () => {
    setConversationId(null);
    setScreen('selection');
  };

  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button size="icon" variant="transparent" onClick={handleBack}>
            <ArrowLeftIcon />
          </Button>
          <p>Chat</p>
        </div>
        <Button size="icon" variant="transparent">
          <MenuIcon />
        </Button>
      </WidgetHeader>
      <div className="flex flex-1 flex-col  gap-y-4 p-4 ">
        <p className="text-sm">{JSON.stringify(conversation)}</p>
      </div>
    </>
  );
}
