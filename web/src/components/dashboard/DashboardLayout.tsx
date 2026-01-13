/**
 * Dashboard Layout Component
 *
 * Shared layout for all member dashboard pages.
 * Includes sidebar navigation and handles auth state.
 */

import { useState, useEffect, type ReactNode } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface User {
  id: string;
  name: string;
  email: string;
}

interface MemberProfile {
  id: string;
  badgeNumber: string | null;
  membershipType: string;
  status: string;
  firstName: string;
  lastName: string;
  expirationDate: string | null;
  volunteerCreditBalance: number;
  duesCurrent: boolean;
  inGracePeriod: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

const accountNavItems = [
  { id: 'home', label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { id: 'profile', label: 'My Profile', href: '/dashboard/profile', icon: '👤' },
  { id: 'events', label: 'My Events', href: '/dashboard/events', icon: '📅' },
  { id: 'payments', label: 'Payments', href: '/dashboard/payments', icon: '💳' },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

const memberNavItems = [
  { id: 'guests', label: 'Guest Sign-In', href: '/dashboard/guests', icon: '🎫' },
  { id: 'volunteer', label: 'Volunteer Hours', href: '/dashboard/volunteer', icon: '⏱️' },
  { id: 'referrals', label: 'Referrals', href: '/dashboard/referrals', icon: '🔗' },
];

const clubNavItems = [
  { id: 'matrix', label: 'Responsibilities', href: '/dashboard/matrix', icon: '📋' },
];

// Helper to check if member has active status
function isMemberActive(member: MemberProfile | null): boolean {
  if (!member) return false;
  return (member.status === 'active' || member.status === 'probationary') && member.duesCurrent;
}

export default function DashboardLayout({ children, activeTab = 'home' }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch session
        const sessionRes = await fetch(`${API_BASE}/api/auth/get-session`, {
          credentials: 'include',
        });

        if (!sessionRes.ok) {
          window.location.href = '/login';
          return;
        }

        const session = await sessionRes.json();
        if (!session?.user) {
          window.location.href = '/login';
          return;
        }

        setUser(session.user);

        // Fetch member profile
        const memberRes = await fetch(`${API_BASE}/api/members/me`, {
          credentials: 'include',
        });

        if (memberRes.ok) {
          const memberData = await memberRes.json();
          setMember(memberData);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner lg" />
          <p className="mt-4 text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const getMemberStatusClass = () => {
    if (member?.duesCurrent) return 'active';
    if (member?.inGracePeriod) return 'grace';
    return 'expired';
  };

  const getMemberStatusLabel = () => {
    if (member?.duesCurrent) return 'Active';
    if (member?.inGracePeriod) return 'Grace Period';
    return 'Expired';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Header with Logo and Close Button */}
          <div className="sidebar-header">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Austin Rifle Club" className="h-8 w-8" />
              <span className="font-bold text-accent">Member Portal</span>
            </a>
            <button
              onClick={() => setSidebarOpen(false)}
              className="sidebar-close-btn lg:hidden"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Member Info */}
          {member && (
            <div className="sidebar-member-info">
              <p className="font-semibold text-sm text-primary">{member.firstName} {member.lastName}</p>
              <p className="text-xs text-secondary">Badge: {member.badgeNumber || 'Pending'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`member-status-badge ${getMemberStatusClass()}`}>
                  {getMemberStatusLabel()}
                </span>
                <span className="text-xs text-muted">{member.membershipType}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="sidebar-nav">
            {/* Account Section */}
            <div className="sidebar-nav-section">
              <h3 className="sidebar-nav-section-title">Account</h3>
              <div className="space-y-1">
                {accountNavItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Member Section */}
            <div className="sidebar-nav-section">
              <h3 className="sidebar-nav-section-title">Member Benefits</h3>
              <div className="space-y-1">
                {memberNavItems.map((item) => {
                  const isLocked = !isMemberActive(member);
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                      title={isLocked ? 'Requires active membership' : undefined}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                      {isLocked && (
                        <svg className="w-3.5 h-3.5 ml-auto text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Club Info Section */}
            <div className="sidebar-nav-section">
              <h3 className="sidebar-nav-section-title">Club Info</h3>
              <div className="space-y-1">
                {clubNavItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* Sign Out */}
          <div className="sidebar-footer">
            <button
              onClick={handleSignOut}
              className="sidebar-nav-item w-full"
            >
              <span>🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Mobile header */}
        <header className="dashboard-mobile-header">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-secondary hover:text-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-accent">Member Portal</span>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}
