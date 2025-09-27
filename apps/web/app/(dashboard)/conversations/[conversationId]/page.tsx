import { ConversationIdView } from '@/modules/dashboard/ui/views/conversation-id-view';
import { Id } from '@workspace/backend/_generated/dataModel';

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { conversationId } = await params;
  return (
    <ConversationIdView
      conversationId={conversationId as Id<'conversations'>}
    />
  );
}
