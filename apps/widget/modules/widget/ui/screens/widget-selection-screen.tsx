'use client';

import { Button } from '@workspace/ui/components/button';
import { WidgetHeader } from '../components/widget-header';
import { ChevronRightIcon, MessageSquareTextIcon } from 'lucide-react';
import { useAtom } from 'jotai';
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  errorMessageAtom,
  organizationIdAtom,
  screenAtom,
} from '../../atoms/widget-atoms';
import { useMutation } from 'convex/react';
import { api } from '@workspace/backend/_generated/api';
import { useState } from 'react';
import { WidgetFooter } from '../components/widget-footer';

export function WidgetSelectionScreen() {
  const [isPending, setIsPending] = useState(false);

  const [, setConversationId] = useAtom(conversationIdAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [, setErrorMessage] = useAtom(errorMessageAtom);
  const [organizationId] = useAtom(organizationIdAtom);
  const [contactSessionId] = useAtom(
    contactSessionIdAtomFamily(organizationId || '')
  );

  const createConversation = useMutation(api.public.conversations.create);

  const handleNewConversation = async () => {
    setIsPending(true);

    if (!organizationId) {
      setScreen('error');
      setErrorMessage('Organization ID is required');
      return;
    }

    if (!contactSessionId) {
      setScreen('auth');
      return;
    }

    try {
      const conversationId = await createConversation({
        organizationId,
        contactSessionId,
      });

      setConversationId(conversationId);
      setScreen('chat');
    } catch {
      setScreen('auth');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-4 p-4 overflow-y-auto">
        <Button
          className="h-16 w-full justify-between"
          variant="outline"
          onClick={handleNewConversation}
          disabled={isPending}
        >
          <div className="flex items-center gap-x-2">
            <MessageSquareTextIcon className="size-4" />
            <span>Start a chat</span>
          </div>
          <ChevronRightIcon />
        </Button>
      </div>
      <WidgetFooter />
    </>
  );
}
