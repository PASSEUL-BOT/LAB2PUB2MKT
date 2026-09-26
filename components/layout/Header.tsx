interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate">{description}</p>}
      </div>
      {action}
    </div>
  );
}
