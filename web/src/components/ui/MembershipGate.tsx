/**
 * Membership Gate Component
 *
 * Wraps features that require active membership.
 * Shows locked state with appropriate CTA for non-members.
 */

import type { ReactNode } from 'react';
import LockedFeature from './LockedFeature';

export type MemberStatus =
  | 'prospect'
  | 'probationary'
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'terminated'
  | null;

export type LockedFeatureType = 'guests' | 'volunteer' | 'referrals';

interface MembershipGateProps {
  children: ReactNode;
  feature: LockedFeatureType;
  memberStatus: MemberStatus;
  duesCurrent?: boolean;
}

const featureConfig: Record<
  LockedFeatureType,
  { title: string; description: string; icon: string }
> = {
  guests: {
    title: 'Guest Sign-In',
    description: 'Bring visitors to the range and sign them in digitally.',
    icon: '🎫',
  },
  volunteer: {
    title: 'Volunteer Hours',
    description: 'Log volunteer hours and earn credits toward your dues.',
    icon: '⏱️',
  },
  referrals: {
    title: 'Referral Program',
    description: 'Earn $25 credit for each new member you refer.',
    icon: '🔗',
  },
};

export function isMemberActive(status: MemberStatus): boolean {
  return status === 'active' || status === 'probationary';
}

export default function MembershipGate({
  children,
  feature,
  memberStatus,
  duesCurrent = false,
}: MembershipGateProps) {
  // Allow access for active or probationary members with current dues
  if (isMemberActive(memberStatus) && duesCurrent) {
    return <>{children}</>;
  }

  // Determine the appropriate message and CTA based on status
  let message: string;
  let ctaText: string;
  let ctaHref: string;

  if (memberStatus === null) {
    // No member record at all
    message = 'This feature is available to Austin Rifle Club members.';
    ctaText = 'Apply for Membership';
    ctaHref = '/membership';
  } else if (memberStatus === 'prospect') {
    // Application in progress
    message = 'Complete your membership application to access this feature.';
    ctaText = 'Complete Application';
    ctaHref = '/apply';
  } else if (memberStatus === 'inactive' || !duesCurrent) {
    // Expired membership
    message = 'Your membership has expired. Renew to regain access.';
    ctaText = 'Renew Membership';
    ctaHref = '/dashboard/payments';
  } else if (memberStatus === 'suspended') {
    message = 'Your membership is currently suspended.';
    ctaText = 'Contact Us';
    ctaHref = 'mailto:info@austinrifleclub.org';
  } else if (memberStatus === 'terminated') {
    message = 'Your membership has been terminated.';
    ctaText = 'Contact Us';
    ctaHref = 'mailto:info@austinrifleclub.org';
  } else {
    // Fallback
    message = 'This feature requires an active membership.';
    ctaText = 'View Membership Options';
    ctaHref = '/membership';
  }

  const config = featureConfig[feature];

  return (
    <LockedFeature
      title={config.title}
      description={config.description}
      icon={config.icon}
      message={message}
      ctaText={ctaText}
      ctaHref={ctaHref}
    />
  );
}
