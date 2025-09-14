import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface ConversationStatusProps {
  status: 'unresolved' | 'escalated' | 'resolved';
  className?: string;
}

const configMap = {
  resolved: {
    icon: CheckIcon,
    bgColor: 'bg-[#3FB62F]',
  },
  escalated: {
    icon: ArrowRightIcon,
    bgColor: 'bg-destructive',
  },
  unresolved: {
    icon: ArrowUpIcon,
    bgColor: 'bg-yellow-500',
  },
} as const;

export function ConversationStatus({
  status,
  className,
}: ConversationStatusProps) {
  const Icon = configMap[status].icon;
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-full p-1.5',
        configMap[status].bgColor,
        className
      )}
    >
      <Icon className="size-3 stroke-3 text-white" />
    </div>
  );
}
