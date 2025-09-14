'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useThreadMessages, toUIMessages } from '@convex-dev/agent/react';
import { Button } from '@workspace/ui/components/button';
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from '../../atoms/widget-atoms';
import { WidgetHeader } from '../components/widget-header';
import { ArrowLeftIcon, LoaderCircleIcon, MenuIcon } from 'lucide-react';
import { useAtom } from 'jotai';
import { useAction, useQuery } from 'convex/react';
import { api } from '@workspace/backend/_generated/api';
import {
  AIConversation,
  AIConversationContent,
} from '@workspace/ui/components/ai/conversation';
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@workspace/ui/components/ai/input';
import {
  AIMessage,
  AIMessageContent,
} from '@workspace/ui/components/ai/message';
import { AIResponse } from '@workspace/ui/components/ai/response';

import { Form, FormControl, FormField } from '@workspace/ui/components/form';
import { useInfiniteScroll } from '@workspace/ui/hooks/use-infinite-scroll';
import { InfiniteScrollTrigger } from '@workspace/ui/components/infinite-scroll-trigger';
import { DicebearAvatar } from '@workspace/ui/components/dicebear-avatar';

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export function WidgetChatScreen() {
  const [, setScreen] = useAtom(screenAtom);
  const [conversationId, setConversationId] = useAtom(conversationIdAtom);
  const [organizationId] = useAtom(organizationIdAtom);
  const [contactSessionId] = useAtom(
    contactSessionIdAtomFamily(organizationId || '')
  );

  const formMethods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const createMessage = useAction(api.public.messages.create);

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        }
      : 'skip'
  );

  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : 'skip',
    { initialNumItems: 10 }
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
    });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId) return;

    formMethods.reset();

    await createMessage({
      prompt: values.message,
      threadId: conversation.threadId,
      contactSessionId,
    });
  };

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
      <AIConversation>
        <AIConversationContent>
          {!messages.isLoading && (
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              ref={topElementRef}
            />
          )}
          {messages.isLoading && (
            <div className="flex flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
              <LoaderCircleIcon className="animate-spin" />
              <p className="text-sm">Loading messages...</p>
            </div>
          )}
          {toUIMessages(messages.results ?? [])?.map((message) => (
            <AIMessage
              from={message.role === 'user' ? 'user' : 'assistant'}
              key={message.id}
            >
              <AIMessageContent>
                <AIResponse>{message.text}</AIResponse>
              </AIMessageContent>
              {message.role === 'assistant' && (
                <DicebearAvatar
                  imageUrl="logo.svg"
                  seed="assistant"
                  size={32}
                />
              )}
            </AIMessage>
          ))}
        </AIConversationContent>
      </AIConversation>
      <Form {...formMethods}>
        <AIInput
          onSubmit={formMethods.handleSubmit(handleSubmit)}
          className="rounded-none border-x-0 border-b-0"
        >
          <FormField
            control={formMethods.control}
            name="message"
            disabled={conversation?.status === 'resolved'}
            render={({ field }) => (
              <AIInputTextarea
                value={field.value}
                disabled={conversation?.status === 'resolved'}
                placeholder={
                  conversation?.status === 'resolved'
                    ? 'This conversation has been resolved'
                    : 'Type your message...'
                }
                onChange={field.onChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    formMethods.handleSubmit(handleSubmit)();
                  }
                }}
              />
            )}
          />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit
              disabled={
                conversation?.status === 'resolved' ||
                !formMethods.formState.isValid
              }
              status="ready"
              type="submit"
            />
          </AIInputToolbar>
        </AIInput>
      </Form>
    </>
  );
}
