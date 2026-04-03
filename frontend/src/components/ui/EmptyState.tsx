import { ReactNode } from 'react';
import clsx from 'clsx';
import {
  FileQuestion,
  Package,
  Users,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3 rounded-lg bg-chamber-900 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chamber-800 text-chamber-400">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-white">{title}</h3>

      {description && (
        <p className="max-w-sm text-sm text-chamber-400">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-medium text-chamber-950 transition-colors hover:bg-gold-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Presets

export function NoProblems({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<FileQuestion className="h-6 w-6" />}
      title="No problems yet"
      description="Problems you identify during discovery will appear here."
      actionLabel={onAction ? 'Add Problem' : undefined}
      onAction={onAction}
    />
  );
}

export function NoOffers({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="h-6 w-6" />}
      title="No offers yet"
      description="Create your first offer to start selling."
      actionLabel={onAction ? 'Create Offer' : undefined}
      onAction={onAction}
    />
  );
}

export function NoClients({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-6 w-6" />}
      title="No clients yet"
      description="Add clients to begin managing relationships."
      actionLabel={onAction ? 'Add Client' : undefined}
      onAction={onAction}
    />
  );
}

export function NoEvidence({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<ShieldCheck className="h-6 w-6" />}
      title="No evidence yet"
      description="Compliance evidence will be collected as you work."
      actionLabel={onAction ? 'Upload Evidence' : undefined}
      onAction={onAction}
    />
  );
}

export function NoResults() {
  return (
    <EmptyState
      icon={<Search className="h-6 w-6" />}
      title="No results found"
      description="Try adjusting your search or filters."
    />
  );
}
