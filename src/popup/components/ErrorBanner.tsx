interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-700 bg-red-950 p-3 text-sm text-red-300">
      <span className="mt-0.5 text-red-400 shrink-0">&#9888;</span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-red-400 hover:text-red-200 transition-colors"
          aria-label="Dismiss error"
        >
          &#x2715;
        </button>
      )}
    </div>
  );
}
