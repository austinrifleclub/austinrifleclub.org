/**
 * Membership Tier Badges
 *
 * Visual badges for different membership types and statuses.
 * Provides clear visual hierarchy for membership tiers.
 */

interface MembershipBadgeProps {
  tier: 'individual' | 'family' | 'life' | 'honorary';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

interface StatusBadgeProps {
  status: 'active' | 'grace' | 'expired' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tierLabels = {
  individual: { label: 'Individual', shortLabel: 'IND' },
  family: { label: 'Family', shortLabel: 'FAM' },
  life: { label: 'Life Member', shortLabel: 'LIFE' },
  honorary: { label: 'Honorary', shortLabel: 'HON' },
};

const statusLabels = {
  active: 'Active',
  grace: 'Grace Period',
  expired: 'Expired',
  pending: 'Pending',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 19H22V21H2V19ZM2 5L7 11L12 4L17 11L22 5V17H2V5Z" />
    </svg>
  );
}

function AwardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

const tierIcons = {
  individual: UserIcon,
  family: UsersIcon,
  life: CrownIcon,
  honorary: AwardIcon,
};

export function MembershipBadge({
  tier,
  size = 'md',
  showLabel = true,
  className = '',
}: MembershipBadgeProps) {
  const labels = tierLabels[tier];
  const Icon = tierIcons[tier];

  return (
    <div
      className={`membership-badge membership-badge-${size} membership-tier-${tier} ${className}`}
    >
      <span className={`membership-tier-icon membership-tier-icon-${size} ${tier}`}>
        <Icon className={iconSizes[size]} />
      </span>
      <span>
        {showLabel ? labels.label : labels.shortLabel}
      </span>
      {tier === 'life' && (
        <StarIcon className={`${iconSizes[size]} text-gold-500`} />
      )}
    </div>
  );
}

export function StatusBadge({
  status,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`status-badge status-badge-${size} status-badge-${status} ${className}`}
    >
      <span className={`status-dot status-dot-${status}`} />
      <span>{statusLabels[status]}</span>
    </span>
  );
}

// Combined badge showing tier + status
interface MemberBadgeComboProps {
  tier: 'individual' | 'family' | 'life' | 'honorary';
  status: 'active' | 'grace' | 'expired' | 'pending';
  memberNumber?: string;
  className?: string;
}

export function MemberBadgeCombo({
  tier,
  status,
  memberNumber,
  className = '',
}: MemberBadgeComboProps) {
  const labels = tierLabels[tier];
  const Icon = tierIcons[tier];

  return (
    <div className={`card card-default p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`membership-tier-icon ${tier} w-12 h-12 rounded-xl`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-display font-bold membership-tier-${tier}`}>
              {labels.label}
            </span>
            {tier === 'life' && <StarIcon className="w-4 h-4 text-gold-500" />}
          </div>
          {memberNumber && (
            <p className="text-xs font-mono text-muted">#{memberNumber}</p>
          )}
        </div>
      </div>
      <div className="card-footer mt-3 pt-3">
        <StatusBadge status={status} size="sm" />
      </div>
    </div>
  );
}
