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

const navItems = [
  { id: 'home', label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { id: 'profile', label: 'My Profile', href: '/dashboard/profile', icon: '👤' },
  { id: 'events', label: 'My Events', href: '/dashboard/events', icon: '📅' },
  { id: 'guests', label: 'Guest Sign-In', href: '/dashboard/guests', icon: '🎫' },
  { id: 'payments', label: 'Payments', href: '/dashboard/payments', icon: '💳' },
  { id: 'volunteer', label: 'Volunteer Hours', href: '/dashboard/volunteer', icon: '⏱️' },
  { id: 'referrals', label: 'Referrals', href: '/dashboard/referrals', icon: '🔗' },
];

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="ARC" className="h-8 w-8" />
              <span className="font-bold text-green-800">Member Portal</span>
            </a>
          </div>

          {/* Member Info */}
          {member && (
            <div className="p-4 border-b bg-gray-50">
              <p className="font-semibold text-sm">{member.firstName} {member.lastName}</p>
              <p className="text-xs text-gray-600">Badge: {member.badgeNumber || 'Pending'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    member.duesCurrent
                      ? 'bg-green-100 text-green-700'
                      : member.inGracePeriod
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {member.duesCurrent
                    ? 'Active'
                    : member.inGracePeriod
                      ? 'Grace Period'
                      : 'Expired'}
                </span>
                <span className="text-xs text-gray-500">{member.membershipType}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === item.id
                    ? 'bg-green-100 text-green-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 w-full transition-colors"
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
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-green-800">Member Portal</span>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
