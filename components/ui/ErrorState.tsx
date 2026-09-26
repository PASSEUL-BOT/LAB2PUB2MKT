interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-amber/30 bg-amber/5 px-5 py-4 text-sm text-ink" role="alert">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 text-slate">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-sm font-medium text-teal hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
