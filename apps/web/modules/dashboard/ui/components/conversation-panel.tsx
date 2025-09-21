'use client';

import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { getCountryFlagUrl, getCountryFromTimezone } from '@/lib/country-utils';
import { api } from '@workspace/backend/_generated/api';
import { DicebearAvatar } from '@workspace/ui/components/dicebear-avatar';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';
import { usePaginatedQuery } from 'convex/react';
import {
  ListIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CornerUpLeftIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConversationStatus } from '@workspace/ui/components/conversation-status';
import { useAtom } from 'jotai';
import { statusFilterAtom } from '../../atoms';
import { Doc } from '@workspace/backend/_generated/dataModel';
import { useInfiniteScroll } from '@workspace/ui/hooks/use-infinite-scroll';
import { InfiniteScrollTrigger } from '@workspace/ui/components/infinite-scroll-trigger';
import { ConversationSkeleton } from './conversation-skeleton';

dayjs.extend(relativeTime);

export function ConversationPanel() {
  const pathname = usePathname();
  const [statusFilter, setStatusFilter] = useAtom(statusFilterAtom);
  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    {
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
    {
      initialNumItems: 10,
    }
  );
  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingFirstPage,
    isLoadingMore,
  } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
  });
  return (
    <div className="flex size-full flex-col bg-background text-sidebar-foreground">
      <div className="flex flex-col gap-3.5 border-b p-2">
        <Select
          defaultValue="all"
          onValueChange={(value) =>
            setStatusFilter(value as Doc<'conversations'>['status'] | 'all')
          }
          value={statusFilter}
        >
          <SelectTrigger className="h-8 border-none px-1.5 shadow-none ring-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-0">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListIcon className="size-4" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="unresolved">
              <div className="flex items-center gap-2">
                <ArrowRightIcon className="size-4" />
                <span>Unresolved</span>
              </div>
            </SelectItem>
            <SelectItem value="escalated">
              <div className="flex items-center gap-2">
                <ArrowUpIcon className="size-4" />
                <span>Escalated</span>
              </div>
            </SelectItem>
            <SelectItem value="resolved">
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4" />
                <span>Resolved</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingFirstPage ? (
        <ConversationSkeleton />
      ) : (
        <ScrollArea className="max-h-[calc(100vh-53px)]">
          <div className="flex w-full flex-1 flex-col text-sm">
            {conversations.results.map((conversation) => {
              const isLastMessageFromOperator =
                conversation.lastMessage?.message?.role !== 'user';
              const country = getCountryFromTimezone(
                conversation.contactSession.metadata?.timezone
              );
              const countryFlagUrl = country?.code
                ? getCountryFlagUrl(country.code)
                : null;

              return (
                <Link
                  href={`/conversations/${conversation._id}`}
                  key={conversation._id}
                  className={cn(
                    'relative flex cursor-pointer items-start gap-3 border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground',
                    pathname === `/conversations/${conversation._id}` &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  <div
                    className={cn(
                      '-translate-y-1/2 absolute top-1/2 left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity',
                      pathname === `/conversations/${conversation._id}` &&
                        'opacity-100'
                    )}
                  />
                  <DicebearAvatar
                    seed={conversation.contactSession._id}
                    size={40}
                    badgeImageUrl={countryFlagUrl || undefined}
                    className="shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex w-full items-center gap-2">
                      <span className="truncate font-bold">
                        {conversation.contactSession.name}
                      </span>
                      <span className="ml-auto shrink-0 text-muted-foreground text-sm">
                        {dayjs(conversation._creationTime).fromNow()}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex w-0 grow items-center gap-1">
                        {isLastMessageFromOperator && (
                          <CornerUpLeftIcon className="size-3 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            'line-clamp-1 text-muted-foreground text-xs',
                            !isLastMessageFromOperator && 'font-bold text-black'
                          )}
                        >
                          {conversation.lastMessage?.text}
                        </span>
                      </div>
                      <ConversationStatus status={conversation.status} />
                    </div>
                  </div>
                </Link>
              );
            })}
            <InfiniteScrollTrigger
              ref={topElementRef}
              onLoadMore={handleLoadMore}
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
