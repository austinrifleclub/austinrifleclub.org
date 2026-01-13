/**
 * Payments Component
 *
 * Displays member's payment history and dues status.
 */

import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface Payment {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'dues' | 'event' | 'merchandise' | 'other';
}

interface MembershipInfo {
  membershipType: string;
  status: string;
  expirationDate: string | null;
  duesCurrent: boolean;
  annualDuesAmount: number;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payment history
        const paymentsRes = await fetch(`${API_BASE}/api/payments/history`, {
          credentials: 'include',
        });
        if (paymentsRes.ok) {
          const data = await paymentsRes.json();
          setPayments(data.payments || []);
        }

        // Fetch membership info
        const memberRes = await fetch(`${API_BASE}/api/members/me`, {
          credentials: 'include',
        });
        if (memberRes.ok) {
          const data = await memberRes.json();
          setMembership({
            membershipType: data.membershipType,
            status: data.status,
            expirationDate: data.expirationDate,
            duesCurrent: data.duesCurrent,
            annualDuesAmount: data.annualDuesAmount || 250,
          });
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Failed</span>;
      case 'refunded':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">Refunded</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="payments">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="payments">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payments</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          View your payment history and manage your membership dues
        </p>

        {/* Membership Status Card */}
        {membership && (
          <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Membership Status
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Membership Type</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {membership.membershipType.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className={`font-medium ${membership.duesCurrent ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {membership.duesCurrent ? 'Current' : 'Past Due'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expires</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {membership.expirationDate ? formatDate(membership.expirationDate) : 'N/A'}
                </p>
              </div>
            </div>
            {!membership.duesCurrent && (
              <div className="mt-6 pt-4 border-t dark:border-stone-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Your membership dues need to be renewed.
                </p>
                <button className="btn btn-primary">
                  Pay Dues ({formatCurrency(membership.annualDuesAmount)})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700">
          <div className="p-4 border-b dark:border-stone-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment History
            </h2>
          </div>
          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">💳</div>
              <p className="text-gray-600 dark:text-gray-400">
                No payment history available
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-stone-700">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(payment.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(payment.status)}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
