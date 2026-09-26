interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line px-6 py-14 text-center">
      <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-slate">{description}</p>
      {action}
    </div>
  );
}
