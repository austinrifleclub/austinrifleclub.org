/**
 * Error State Components
 *
 * Styled error displays for various error scenarios.
 * Provides clear feedback with recovery actions.
 */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

// Error illustration - broken target
function ErrorIllustration() {
  return (
    <svg
      className="w-24 h-24 text-safety-400"
      viewBox="0 0 96 96"
      fill="none"
    >
      {/* Broken target rings */}
      <circle
        cx="48"
        cy="48"
        r="36"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="20 10"
      />
      <circle
        cx="48"
        cy="48"
        r="24"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="15 8"
      />
      <circle
        cx="48"
        cy="48"
        r="12"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="10 5"
      />
      {/* X mark */}
      <path
        d="M38 38L58 58M58 38L38 58"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Network error illustration
function NetworkErrorIllustration() {
  return (
    <svg
      className="w-24 h-24 text-safety-400"
      viewBox="0 0 96 96"
      fill="none"
    >
      {/* Cloud shape */}
      <path
        d="M76 50C76 41 68 34 58 34C57 34 56 34 55 34C52 26 45 20 36 20C24 20 14 30 14 42C14 43 14 44 14 45C10 47 8 52 8 58C8 66 14 72 22 72H74C82 72 88 66 88 58C88 52 84 47 78 45C77 45 76 45 76 45V50Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* X mark on cloud */}
      <path
        d="M40 48L56 64M56 48L40 64"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 404 illustration
function NotFoundIllustration() {
  return (
    <svg
      className="w-32 h-24 text-safety-400"
      viewBox="0 0 128 96"
      fill="none"
    >
      {/* 4 */}
      <path
        d="M20 65V35L35 65H20ZM35 45H45V75"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 0 - as target */}
      <circle cx="64" cy="55" r="20" stroke="currentColor" strokeWidth="4" />
      <circle cx="64" cy="55" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="64" cy="55" r="3" fill="currentColor" />
      {/* 4 */}
      <path
        d="M88 65V35L103 65H88ZM103 45H113V75"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Server error illustration
function ServerErrorIllustration() {
  return (
    <svg
      className="w-24 h-24 text-safety-400"
      viewBox="0 0 96 96"
      fill="none"
    >
      {/* Server rack */}
      <rect
        x="20"
        y="16"
        width="56"
        height="64"
        rx="4"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M20 36H76" stroke="currentColor" strokeWidth="2" />
      <path d="M20 56H76" stroke="currentColor" strokeWidth="2" />
      {/* Status lights */}
      <circle cx="30" cy="26" r="3" fill="currentColor" />
      <circle cx="40" cy="26" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="30" cy="46" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="40" cy="46" r="3" fill="currentColor" opacity="0.5" />
      {/* Error on bottom */}
      <path
        d="M40 66L56 82M56 66L40 82"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Base error state component
export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="mx-auto mb-6">
        <ErrorIllustration />
      </div>
      <h3 className="font-display text-xl font-semibold text-primary mb-2">
        {title}
      </h3>
      <p className="text-muted max-w-md mx-auto mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary inline-flex items-center gap-2 px-6 py-2.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {retryLabel}
        </button>
      )}
    </div>
  );
}

// Network error variant
export function NetworkError({
  onRetry,
  className = '',
}: Pick<ErrorStateProps, 'onRetry' | 'className'>) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="mx-auto mb-6">
        <NetworkErrorIllustration />
      </div>
      <h3 className="font-display text-xl font-semibold text-primary mb-2">
        Connection Lost
      </h3>
      <p className="text-muted max-w-md mx-auto mb-6">
        Unable to connect to the server. Please check your internet connection.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary inline-flex items-center gap-2 px-6 py-2.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry Connection
        </button>
      )}
    </div>
  );
}

// 404 Not Found variant
export function NotFoundError({
  title = 'Page Not Found',
  message = 'The page you\'re looking for doesn\'t exist or has been moved.',
  backLink = '/',
  backLabel = 'Go Home',
  className = '',
}: {
  title?: string;
  message?: string;
  backLink?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <div className={`text-center py-16 px-4 ${className}`}>
      <div className="mx-auto mb-8">
        <NotFoundIllustration />
      </div>
      <h1 className="font-display text-3xl font-bold text-primary mb-3">
        {title}
      </h1>
      <p className="text-muted max-w-md mx-auto mb-8">{message}</p>
      <a
        href={backLink}
        className="btn btn-primary inline-flex items-center gap-2 px-6 py-3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {backLabel}
      </a>
    </div>
  );
}

// Server error variant (500)
export function ServerError({
  onRetry,
  className = '',
}: Pick<ErrorStateProps, 'onRetry' | 'className'>) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="mx-auto mb-6">
        <ServerErrorIllustration />
      </div>
      <h3 className="font-display text-xl font-semibold text-primary mb-2">
        Server Error
      </h3>
      <p className="text-muted max-w-md mx-auto mb-6">
        Our servers are having trouble right now. Please try again in a few moments.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary inline-flex items-center gap-2 px-6 py-2.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}

// Inline error alert
export function ErrorAlert({
  title,
  message,
  onDismiss,
  className = '',
}: {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`alert alert-error rounded-xl p-4 ${className}`}
      role="alert"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:opacity-80 transition-opacity"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Success alert
export function SuccessAlert({
  title,
  message,
  onDismiss,
  className = '',
}: {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`alert alert-success rounded-xl p-4 ${className}`}
      role="alert"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:opacity-80 transition-opacity"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
