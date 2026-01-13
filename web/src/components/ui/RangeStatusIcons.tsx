/**
 * Custom Range Status Icons
 *
 * Shooting sports themed icons for range status display.
 * Each icon represents a different range status with visual clarity.
 */

interface IconProps {
  className?: string;
  size?: number;
}

// Open status - Target with checkmark (range is available)
export function OpenIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Target rings */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      {/* Checkmark overlay */}
      <path
        d="M8 12.5L10.5 15L16 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Event status - Calendar with target
export function EventIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Calendar */}
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Target in calendar */}
      <circle cx="12" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

// Closed status - Target with X
export function ClosedIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Target rings */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* X mark */}
      <path
        d="M9 9L15 15M15 9L9 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Maintenance status - Wrench with target
export function MaintenanceIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Wrench */}
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// Pistol icon for pistol ranges
export function PistolIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 7H18C19.1 7 20 7.9 20 9V11H22V14H20V15C20 16.1 19.1 17 18 17H13L11 21H8L10 17H4C2.9 17 2 16.1 2 15V9C2 7.9 2.9 7 4 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="7" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Rifle icon for rifle ranges
export function RifleIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 12H16M16 12L14 9M16 12L14 15M16 8V16M20 8H22V16H20M20 12H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="4" y="10" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// Status indicator dot with pulse animation
export function StatusDot({ status, className = '' }: { status: 'open' | 'event' | 'closed' | 'maintenance'; className?: string }) {
  const colors = {
    open: 'bg-forest-500',
    event: 'bg-steel-500',
    closed: 'bg-safety-500',
    maintenance: 'bg-earth-600',
  };

  return (
    <span className={`relative flex h-3 w-3 ${className}`}>
      {status === 'open' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75`}></span>
      )}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${colors[status]}`}></span>
    </span>
  );
}

// Get icon component by status
export function getStatusIcon(status: 'open' | 'event' | 'closed' | 'maintenance') {
  const icons = {
    open: OpenIcon,
    event: EventIcon,
    closed: ClosedIcon,
    maintenance: MaintenanceIcon,
  };
  return icons[status];
}
