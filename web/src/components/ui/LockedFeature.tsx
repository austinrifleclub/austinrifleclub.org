/**
 * Locked Feature Component
 *
 * Displays a locked state for features requiring membership.
 * Shows feature info with a call-to-action.
 */

interface LockedFeatureProps {
  title: string;
  description: string;
  icon: string;
  message: string;
  ctaText: string;
  ctaHref: string;
}

export default function LockedFeature({
  title,
  description,
  icon,
  message,
  ctaText,
  ctaHref,
}: LockedFeatureProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border dark:border-stone-700 overflow-hidden">
        {/* Header with lock indicator */}
        <div className="bg-gradient-to-r from-stone-100 to-stone-50 dark:from-stone-700 dark:to-stone-800 px-6 py-4 border-b dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl opacity-50">{icon}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-200 dark:bg-stone-600 rounded-full">
              <svg
                className="w-4 h-4 text-stone-600 dark:text-stone-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                Members Only
              </span>
            </div>
          </div>
        </div>

        {/* Locked content area */}
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-700 mb-6">
            <svg
              className="w-10 h-10 text-stone-400 dark:text-stone-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Feature Locked
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {message}
          </p>

          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white font-medium rounded-lg transition-colors"
          >
            {ctaText}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>

        {/* Benefits preview */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/50 border-t dark:border-stone-700">
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
            Membership includes access to all club facilities, events, and member benefits.
          </p>
        </div>
      </div>
    </div>
  );
}
