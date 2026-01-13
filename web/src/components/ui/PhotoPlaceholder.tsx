/**
 * Photo Placeholder Component
 *
 * Displays a styled placeholder for images with proper aspect ratios.
 * Used when actual photography is not yet available.
 */

interface PhotoPlaceholderProps {
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2' | '2/3';
  variant?: 'range' | 'event' | 'member' | 'generic';
  className?: string;
  alt?: string;
}

const variantConfig = {
  range: {
    icon: RangeIcon,
    bgGradient: 'from-forest-100 to-forest-50',
    iconColor: 'text-forest-300',
    label: 'Range Photo',
  },
  event: {
    icon: CalendarIcon,
    bgGradient: 'from-steel-100 to-steel-50',
    iconColor: 'text-steel-300',
    label: 'Event Photo',
  },
  member: {
    icon: UserIcon,
    bgGradient: 'from-earth-100 to-earth-50',
    iconColor: 'text-earth-300',
    label: 'Member Photo',
  },
  generic: {
    icon: ImageIcon,
    bgGradient: 'from-stone-100 to-stone-50',
    iconColor: 'text-stone-300',
    label: 'Photo',
  },
};

function RangeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2V6M12 18V22M2 12H6M18 12H22" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 9H21M8 2V5M16 2V5" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20C4 17 8 14 12 14C16 14 20 17 20 20" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15L16 10L5 21" />
    </svg>
  );
}

const aspectRatioClasses = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '3/2': 'aspect-[3/2]',
  '2/3': 'aspect-[2/3]',
};

export function PhotoPlaceholder({
  aspectRatio = '16/9',
  variant = 'generic',
  className = '',
  alt,
}: PhotoPlaceholderProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${config.bgGradient} ${aspectRatioClasses[aspectRatio]} ${className}`}
      role="img"
      aria-label={alt || config.label}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Icon className={`w-16 h-16 ${config.iconColor}`} />
        <span className={`mt-2 text-sm font-medium ${config.iconColor}`}>
          {config.label}
        </span>
      </div>
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// Hero placeholder with text overlay support
interface HeroPlaceholderProps {
  className?: string;
  children?: React.ReactNode;
}

export function HeroPlaceholder({ className = '', children }: HeroPlaceholderProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-forest-800 to-forest-900 aspect-[4/3] ${className}`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="hero-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-white">
        {children || (
          <div className="text-center">
            <RangeIcon className="w-24 h-24 mx-auto opacity-30" />
            <p className="mt-4 text-forest-200 font-medium">Hero Image</p>
          </div>
        )}
      </div>
    </div>
  );
}
