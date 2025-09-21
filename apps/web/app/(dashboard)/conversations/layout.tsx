import { ConversationsLayout } from '@/modules/dashboard/ui/layouts/conversations-layout';

export default function ConversationsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConversationsLayout>{children}</ConversationsLayout>;
}
