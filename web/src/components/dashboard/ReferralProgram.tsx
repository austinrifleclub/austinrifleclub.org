/**
 * Referral Program Component
 *
 * Allows members to share their referral link and track referrals.
 */

import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import MembershipGate, { type MemberStatus } from '../ui/MembershipGate';
import { API_BASE } from '../../lib/api';

interface ReferralData {
  code: string;
  referralCount: number;
  referralUrl: string;
}

export default function ReferralProgram() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [memberStatus, setMemberStatus] = useState<MemberStatus>(null);
  const [duesCurrent, setDuesCurrent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch member status first
        const memberRes = await fetch(`${API_BASE}/api/members/me`, {
          credentials: 'include',
        });
        if (memberRes.ok) {
          const memberData = await memberRes.json();
          setMemberStatus(memberData.status as MemberStatus);
          setDuesCurrent(memberData.duesCurrent);
        }

        // Fetch referral code
        const res = await fetch(`${API_BASE}/api/members/me/referral-code`, {
          credentials: 'include',
        });
        if (res.ok) {
          setReferralData(await res.json());
        } else if (res.status !== 404) {
          setError('Unable to load referral data');
        }
      } catch {
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyToClipboard = async () => {
    if (!referralData) return;

    try {
      await navigator.clipboard.writeText(referralData.referralUrl);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="referrals">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout activeTab="referrals">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="referrals">
      <MembershipGate feature="referrals" memberStatus={memberStatus} duesCurrent={duesCurrent}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Referral Program</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Earn $25 in volunteer credit for each new member you refer!
        </p>

        {/* Referral Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 text-center">
            <p className="text-3xl font-bold text-navy-700 dark:text-blue-400">
              {referralData?.referralCount || 0}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Members Referred</p>
          </div>
          <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 text-center">
            <p className="text-3xl font-bold text-navy-700 dark:text-blue-400">
              ${(referralData?.referralCount || 0) * 25}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Credits Earned</p>
          </div>
          <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 text-center">
            <p className="text-3xl font-bold text-navy-700 dark:text-blue-400">$25</p>
            <p className="text-gray-600 text-sm">Per Referral</p>
          </div>
        </div>

        {/* Share Link */}
        <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Your Referral Link</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              readOnly
              value={referralData?.referralUrl || ''}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-navy-100 text-navy-700'
                  : copyError
                  ? 'bg-red-100 text-red-700'
                  : 'bg-navy-700 hover:bg-navy-800 text-white'
              }`}
            >
              {copied ? 'Copied!' : copyError ? 'Failed to copy' : 'Copy'}
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Share this link with friends interested in joining Austin Rifle Club.
            When they complete their membership, you'll receive $25 in volunteer credit.
          </p>
        </div>

        {/* Share Options */}
        <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Share Via</h2>

          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:?subject=Join%20me%20at%20Austin%20Rifle%20Club&body=I%27d%20like%20to%20invite%20you%20to%20join%20Austin%20Rifle%20Club!%20Use%20my%20referral%20link%3A%20${encodeURIComponent(referralData?.referralUrl || '')}`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>📧</span> Email
            </a>
            <a
              href={`sms:?body=Join%20me%20at%20Austin%20Rifle%20Club!%20${encodeURIComponent(referralData?.referralUrl || '')}`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>💬</span> Text
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralData?.referralUrl || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>📘</span> Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=Join%20me%20at%20Austin%20Rifle%20Club!&url=${encodeURIComponent(referralData?.referralUrl || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>🐦</span> Twitter
            </a>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-50 dark:bg-stone-900 rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-navy-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-navy-800 dark:text-blue-400 font-bold">1</span>
              </div>
              <h3 className="font-medium mb-1 text-gray-900 dark:text-white">Share Your Link</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send your unique referral link to friends interested in joining.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-navy-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-navy-800 dark:text-blue-400 font-bold">2</span>
              </div>
              <h3 className="font-medium mb-1 text-gray-900 dark:text-white">They Join</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your friend completes their membership application.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-navy-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-navy-800 dark:text-blue-400 font-bold">3</span>
              </div>
              <h3 className="font-medium mb-1 text-gray-900 dark:text-white">You Get Credit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                $25 is added to your volunteer credit balance automatically.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white dark:bg-stone-800 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Credits are applied after the referred member completes their
              first dues payment. There's no limit to how many members you can refer. Credits can
              be used toward dues renewal or club merchandise.
            </p>
          </div>
        </div>
      </div>
      </MembershipGate>
    </DashboardLayout>
  );
}
