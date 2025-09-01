import { cn } from '@workspace/ui/lib/utils';

interface WidgetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function WidgetHeader({ children, className }: WidgetHeaderProps) {
  return (
    <header
      className={cn(
        'bg-gradient-to-b from-primary to-[#0b63f3] p-4 text-primary-foreground',
        className
      )}
    >
      {children}
    </header>
  );
}
