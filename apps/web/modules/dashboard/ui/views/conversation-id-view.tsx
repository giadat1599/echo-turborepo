'use client';

import { api } from '@workspace/backend/_generated/api';
import { Id } from '@workspace/backend/_generated/dataModel';
import { Button } from '@workspace/ui/components/button';
import { useAction, useMutation, useQuery } from 'convex/react';
import { toUIMessages, useThreadMessages } from '@convex-dev/agent/react';
import { MoreHorizontalIcon, Wand2Icon } from 'lucide-react';
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from '@workspace/ui/components/ai/conversation';
import {
  AIInput,
  AIInputButton,
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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DicebearAvatar } from '@workspace/ui/components/dicebear-avatar';
import { Form, FormField } from '@workspace/ui/components/form';
import { ConversationStatusButton } from '../components/conversation-status-button';
import { useState } from 'react';
import { useInfiniteScroll } from '@workspace/ui/hooks/use-infinite-scroll';
import { InfiniteScrollTrigger } from '@workspace/ui/components/infinite-scroll-trigger';
import { ConversationMessageSkeleton } from '../components/conversation-message-skeleton';

interface ConversationIdView {
  conversationId: Id<'conversations'>;
}

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export function ConversationIdView({ conversationId }: ConversationIdView) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const formMethods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const conversation = useQuery(api.private.conversations.getOne, {
    conversationId,
  });

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId ? { threadId: conversation.threadId } : 'skip',
    { initialNumItems: 10 }
  );

  const enhanceResponse = useAction(api.private.messages.enhanceResponse);
  const createMessage = useMutation(api.private.messages.create);
  const updateConversationStatus = useMutation(
    api.private.conversations.updateStatus
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
    });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMessage({
        conversationId,
        prompt: values.message,
      });
      formMethods.reset();
    } catch (error) {
      console.log('Error creating message:', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!conversation) return;

    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);

    let newStatus: 'unresolved' | 'escalated' | 'resolved';

    if (conversation.status === 'unresolved') newStatus = 'escalated';
    else if (conversation.status === 'escalated') newStatus = 'resolved';
    else newStatus = 'unresolved';

    try {
      await updateConversationStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      console.log('Error updating conversation status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEnhanceResponse = async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    try {
      const response = await enhanceResponse({
        prompt: formMethods.getValues('message'),
      });
      formMethods.setValue('message', response);
    } catch (error) {
      console.log('Error enhancing response:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  if (conversation === undefined || messages.status === 'LoadingFirstPage') {
    return <ConversationMessageSkeleton />;
  }

  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
        {conversation && (
          <ConversationStatusButton
            onClick={handleToggleStatus}
            status={conversation?.status}
            disabled={isUpdatingStatus}
          />
        )}
      </div>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          <InfiniteScrollTrigger
            ref={topElementRef}
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
          {toUIMessages(messages.results ?? [])?.map((message) => (
            <AIMessage
              key={message.id}
              from={message.role === 'user' ? 'assistant' : 'user'}
            >
              <AIMessageContent>
                <AIResponse>{message.text}</AIResponse>
              </AIMessageContent>
              {message.role === 'user' && (
                <DicebearAvatar
                  seed={conversation?.contactSessionId ?? 'user'}
                  size={32}
                />
              )}
            </AIMessage>
          ))}
          <AIConversationScrollButton />
        </AIConversationContent>
      </AIConversation>
      <div className="p-2">
        <Form {...formMethods}>
          <AIInput onSubmit={formMethods.handleSubmit(onSubmit)}>
            <FormField
              control={formMethods.control}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  disabled={
                    conversation?.status === 'resolved' ||
                    formMethods.formState.isSubmitting ||
                    isEnhancing
                  }
                  onChange={field.onChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      formMethods.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === 'resolved'
                      ? 'This conversation has been resolved'
                      : 'Type your response as an operator...'
                  }
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton
                  disabled={
                    conversation?.status === 'resolved' ||
                    isEnhancing ||
                    !formMethods.formState.isValid
                  }
                  onClick={handleEnhanceResponse}
                >
                  <Wand2Icon />
                  {isEnhancing ? 'Enhancing...' : 'Enhance'}
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit
                disabled={
                  conversation?.status === 'resolved' ||
                  !formMethods.formState.isValid ||
                  formMethods.formState.isSubmitting
                }
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </div>
  );
}
