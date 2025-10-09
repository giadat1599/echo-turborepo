import { ArrowLeftRightIcon, type LucideIcon, PlugIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@workspace/ui/components/button';

export interface Feature {
  icon: LucideIcon;
  label: string;
  description: string;
}

interface PluginCardProps {
  disabled?: boolean;
  serviceName: string;
  serviceImage: string;
  features: Feature[];
  onSubmit: () => void;
}

export function PluginCard({
  disabled,
  serviceName,
  serviceImage,
  features,
  onSubmit,
}: PluginCardProps) {
  return (
    <div className="h-fit w-full rounded-lg border bg-background p-8">
      <div className="mb-6 flex items-center justify-center gap-6">
        <div className="flex flex-col items-center">
          <Image
            className="rounded object-contain"
            src={serviceImage}
            alt={serviceName}
            width={40}
            height={40}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <ArrowLeftRightIcon />
        </div>
        <div className="flex flex-col items-center">
          <Image
            className="object-contain"
            src="/logo.svg"
            alt="Platform"
            width={40}
            height={40}
          />
        </div>
      </div>
      <div className="mb-6 text-center">
        <p className="text-lg">Connect your {serviceName} account</p>
      </div>
      <div className="mb-6">
        <div className="space-y-4">
          {features.map((feature) => (
            <div className="flex items-center gap-3" key={feature.label}>
              <div className="flex size-8 items-center justify-center rounded-lg border bg-muted">
                <feature.icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm">{feature.label}</div>
                <div className="text-muted-foreground text-xs">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <Button
          className="size-full"
          variant="default"
          onClick={onSubmit}
          disabled={disabled}
        >
          Connect
          <PlugIcon />
        </Button>
      </div>
    </div>
  );
}
