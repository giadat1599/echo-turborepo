'use client';

import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { ArrowLeftIcon, LoaderCircleIcon } from 'lucide-react';
import { WidgetHeader } from '../components/widget-header';
import { WidgetFooter } from '../components/widget-footer';
import { Button } from '@workspace/ui/components/button';
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from '../../atoms/widget-atoms';
import { useAtom } from 'jotai';
import { usePaginatedQuery } from 'convex/react';
import { api } from '@workspace/backend/_generated/api';
import { ConversationStatus } from '@workspace/ui/components/conversation-status';
import { useInfiniteScroll } from '@workspace/ui/hooks/use-infinite-scroll';
import { InfiniteScrollTrigger } from '@workspace/ui/components/infinite-scroll-trigger';

dayjs.extend(relativeTime);

export function WidgetInboxScreen() {
  const [, setScreen] = useAtom(screenAtom);
  const [organizationId] = useAtom(organizationIdAtom);
  const [, setConversationId] = useAtom(conversationIdAtom);
  const [contactSessionId] = useAtom(
    contactSessionIdAtomFamily(organizationId || '')
  );
  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId ? { contactSessionId } : 'skip',
    { initialNumItems: 10 }
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: conversations.status,
      loadMore: conversations.loadMore,
      loadSize: 10,
    });

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-x-2">
          <Button
            variant="transparent"
            size="icon"
            onClick={() => setScreen('selection')}
          >
            <ArrowLeftIcon />
          </Button>
          <p>Inbox</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-2 p-4 overflow-y-scroll">
        {conversations.isLoading && (
          <div className="flex flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
            <LoaderCircleIcon className="animate-spin" />
            <p className="text-sm">Loading conversations...</p>
          </div>
        )}
        {conversations?.results.length > 0 &&
          conversations.results.map((conversation) => (
            <Button
              variant="outline"
              className="h-20 w-full justify-between"
              key={conversation._id}
              onClick={() => {
                setConversationId(conversation._id);
                setScreen('chat');
              }}
            >
              <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="text-muted-foreground text-xs">Chat</p>
                  <p className="text-muted-foreground text-xs">
                    {dayjs(conversation._creationTime).fromNow()}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="text-sm truncate">
                    {conversation.lastMessage?.text}
                  </p>
                  <ConversationStatus status={conversation.status} />
                </div>
              </div>
            </Button>
          ))}
        {!conversations.isLoading && (
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
        )}
      </div>
      <WidgetFooter />
    </>
  );
}
