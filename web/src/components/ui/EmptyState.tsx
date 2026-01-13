/**
 * Empty State Components
 *
 * Illustrated empty states for various scenarios.
 * Provides visual feedback when content is unavailable.
 */

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// Base empty state wrapper
function EmptyStateWrapper({
  title,
  description,
  action,
  className = '',
  children,
}: EmptyStateProps & { children: React.ReactNode }) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">{children}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}

// No events illustration
function NoEventsIllustration() {
  return (
    <svg
      className="w-32 h-32"
      viewBox="0 0 120 120"
      fill="none"
    >
      <rect
        x="20"
        y="25"
        width="80"
        height="70"
        rx="8"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M20 45H100" stroke="currentColor" strokeWidth="3" />
      <path
        d="M35 25V15"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M85 25V15"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="45" cy="65" r="6" fill="currentColor" opacity="0.3" />
      <circle cx="60" cy="65" r="6" fill="currentColor" opacity="0.3" />
      <circle cx="75" cy="65" r="6" fill="currentColor" opacity="0.3" />
      <circle cx="45" cy="82" r="6" fill="currentColor" opacity="0.3" />
      <circle cx="60" cy="82" r="6" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// No members illustration
function NoMembersIllustration() {
  return (
    <svg
      className="w-32 h-32"
      viewBox="0 0 120 120"
      fill="none"
    >
      <circle cx="60" cy="40" r="20" stroke="currentColor" strokeWidth="3" />
      <path
        d="M30 95C30 77.3 43.3 63 60 63C76.7 63 90 77.3 90 95"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="35" cy="45" r="10" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <circle cx="85" cy="45" r="10" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    </svg>
  );
}

// No ranges illustration (target)
function NoRangesIllustration() {
  return (
    <svg
      className="w-32 h-32"
      viewBox="0 0 120 120"
      fill="none"
    >
      <circle cx="60" cy="60" r="45" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="30" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="15" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="4" fill="currentColor" />
      {/* Crosshairs */}
      <path d="M60 10V25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 95V110" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 60H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M95 60H110" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// No results illustration (search)
function NoResultsIllustration() {
  return (
    <svg
      className="w-32 h-32"
      viewBox="0 0 120 120"
      fill="none"
    >
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="3" />
      <path
        d="M72 72L100 100"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M40 45L60 45"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M35 55L55 55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

// No notifications illustration
function NoNotificationsIllustration() {
  return (
    <svg
      className="w-32 h-32"
      viewBox="0 0 120 120"
      fill="none"
    >
      <path
        d="M60 25C43 25 30 38 30 55V70L20 85H100L90 70V55C90 38 77 25 60 25Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M50 85C50 91 54 100 60 100C66 100 70 91 70 85"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle cx="60" cy="20" r="5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// Generic empty box illustration
function EmptyBoxIllustration() {
  return (
    <svg
      className="w-32 h-32"
      viewBox="0 0 120 120"
      fill="none"
    >
      <path
        d="M20 40L60 20L100 40V80L60 100L20 80V40Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M20 40L60 60L100 40" stroke="currentColor" strokeWidth="3" />
      <path d="M60 60V100" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="55" r="8" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

// Empty state variants
export function EmptyStateEvents(props: Omit<EmptyStateProps, 'title'> & { title?: string }) {
  return (
    <EmptyStateWrapper
      title={props.title || 'No Events'}
      description={props.description || 'There are no upcoming events scheduled at this time.'}
      action={props.action}
      className={props.className}
    >
      <NoEventsIllustration />
    </EmptyStateWrapper>
  );
}

export function EmptyStateMembers(props: Omit<EmptyStateProps, 'title'> & { title?: string }) {
  return (
    <EmptyStateWrapper
      title={props.title || 'No Members Found'}
      description={props.description || 'No members match your search criteria.'}
      action={props.action}
      className={props.className}
    >
      <NoMembersIllustration />
    </EmptyStateWrapper>
  );
}

export function EmptyStateRanges(props: Omit<EmptyStateProps, 'title'> & { title?: string }) {
  return (
    <EmptyStateWrapper
      title={props.title || 'No Ranges Available'}
      description={props.description || 'Range information is currently unavailable.'}
      action={props.action}
      className={props.className}
    >
      <NoRangesIllustration />
    </EmptyStateWrapper>
  );
}

export function EmptyStateSearch(props: Omit<EmptyStateProps, 'title'> & { title?: string }) {
  return (
    <EmptyStateWrapper
      title={props.title || 'No Results'}
      description={props.description || 'We couldn\'t find anything matching your search.'}
      action={props.action}
      className={props.className}
    >
      <NoResultsIllustration />
    </EmptyStateWrapper>
  );
}

export function EmptyStateNotifications(props: Omit<EmptyStateProps, 'title'> & { title?: string }) {
  return (
    <EmptyStateWrapper
      title={props.title || 'All Caught Up!'}
      description={props.description || 'You have no new notifications.'}
      action={props.action}
      className={props.className}
    >
      <NoNotificationsIllustration />
    </EmptyStateWrapper>
  );
}

export function EmptyStateGeneric(props: EmptyStateProps) {
  return (
    <EmptyStateWrapper {...props}>
      <EmptyBoxIllustration />
    </EmptyStateWrapper>
  );
}

// Default export with all variants
export const EmptyState = {
  Events: EmptyStateEvents,
  Members: EmptyStateMembers,
  Ranges: EmptyStateRanges,
  Search: EmptyStateSearch,
  Notifications: EmptyStateNotifications,
  Generic: EmptyStateGeneric,
};
