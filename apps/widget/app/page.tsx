'use client';

import { WidgetView } from '@/modules/widget/ui/views/widget-view';

interface PageProps {
  searchParams: Promise<{ organizationId: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { organizationId } = await searchParams;

  return <WidgetView organizationId={organizationId} />;
}
