"use client";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

export default function ErrorBanner({
  message,
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-900/95 border-b border-red-700 px-6 py-3 animate-slide-down">
      <div className="max-w-5xl mx-auto flex items-center gap-4">
        <span className="text-red-300 text-base flex-1">{message}</span>
        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-1.5 bg-red-700 text-white text-sm rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              재시도
            </button>
          )}
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-red-300 text-sm hover:text-white transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
