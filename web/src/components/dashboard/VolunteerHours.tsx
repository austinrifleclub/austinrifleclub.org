/**
 * Volunteer Hours Component
 *
 * Log and view volunteer hours and credits.
 */

import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import MembershipGate, { type MemberStatus } from '../ui/MembershipGate';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface VolunteerEntry {
  id: string;
  date: string;
  hours: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  creditValue: number;
}

interface VolunteerStats {
  totalHours: number;
  totalCredits: number;
  pendingHours: number;
}

export default function VolunteerHours() {
  const [entries, setEntries] = useState<VolunteerEntry[]>([]);
  const [stats, setStats] = useState<VolunteerStats>({ totalHours: 0, totalCredits: 0, pendingHours: 0 });
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [formData, setFormData] = useState({ date: '', hours: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [memberStatus, setMemberStatus] = useState<MemberStatus>(null);
  const [duesCurrent, setDuesCurrent] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch member status
      const memberRes = await fetch(`${API_BASE}/api/members/me`, {
        credentials: 'include',
      });
      if (memberRes.ok) {
        const memberData = await memberRes.json();
        setMemberStatus(memberData.status as MemberStatus);
        setDuesCurrent(memberData.duesCurrent);
      }

      // Fetch volunteer data
      const res = await fetch(`${API_BASE}/api/volunteer/hours`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setStats(data.stats || { totalHours: 0, totalCredits: 0, pendingHours: 0 });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteerData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/volunteer/hours`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setStats(data.stats || { totalHours: 0, totalCredits: 0, pendingHours: 0 });
      }
    } catch {
      // silent
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/volunteer/log`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          hours: parseFloat(formData.hours),
          description: formData.description,
        }),
      });

      if (res.ok) {
        setShowLogForm(false);
        setFormData({ date: '', hours: '', description: '' });
        fetchVolunteerData();
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejected</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="volunteer">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="volunteer">
      <MembershipGate feature="volunteer" memberStatus={memberStatus} duesCurrent={duesCurrent}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Volunteer Hours</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your volunteer contributions and earn credits
              </p>
            </div>
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="btn btn-primary"
            >
              {showLogForm ? 'Cancel' : 'Log Hours'}
            </button>
          </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 text-center">
            <p className="text-3xl font-bold text-navy-700 dark:text-blue-400">
              {stats.totalHours}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Hours</p>
          </div>
          <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${stats.totalCredits}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Credits Earned</p>
          </div>
          <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 text-center">
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pendingHours}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Approval</p>
          </div>
        </div>

        {/* Log Form */}
        {showLogForm && (
          <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Log Volunteer Hours
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    required
                    className="form-input w-full"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Hours</label>
                  <input
                    type="number"
                    required
                    min="0.5"
                    step="0.5"
                    className="form-input w-full"
                    placeholder="e.g., 4"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  required
                  rows={3}
                  className="form-input w-full"
                  placeholder="Describe your volunteer work..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Hours'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hours History */}
        <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700">
          <div className="p-4 border-b dark:border-stone-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hours History
            </h2>
          </div>
          {entries.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">⏱️</div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                No volunteer hours logged yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Volunteer at club events to earn credits toward your dues!
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-stone-700">
              {entries.map((entry) => (
                <div key={entry.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(entry.date)}
                    </span>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(entry.status)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {entry.hours} hrs
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.description}
                  </p>
                  {entry.status === 'approved' && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Credit: ${entry.creditValue}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            How Volunteer Credits Work
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Earn $12.50 per hour of approved volunteer work</li>
            <li>• Credits can be applied toward annual dues renewal</li>
            <li>• Hours must be approved by a board member</li>
            <li>• Maximum 20 hours ($250) credit per year</li>
          </ul>
        </div>
        </div>
      </MembershipGate>
    </DashboardLayout>
  );
}
