/**
 * Applications Manager Component
 *
 * Admin interface for reviewing and processing membership applications.
 */

import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  membershipType: string;
  status: string;
  createdAt: string;
  referredBy: string | null;
  notes: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlist: 'bg-blue-100 text-blue-800',
};

export default function ApplicationsManager() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`${API_BASE}/api/applications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleAction = async (appId: string, action: 'approve' | 'reject' | 'waitlist') => {
    setProcessing(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/applications/${appId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'added to waitlist';
        setMessage({ type: 'success', text: `Application ${actionText} successfully` });
        setSelectedApp(null);
        fetchApplications();
      } else {
        throw new Error('Failed to process');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process application' });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-yellow-600 mt-1">
              {pendingCount} application{pendingCount !== 1 ? 's' : ''} pending review
            </p>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'waitlist', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications</h3>
          <p className="text-gray-500">
            {statusFilter === 'pending' ? 'No pending applications to review.' : `No ${statusFilter} applications found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{app.firstName} {app.lastName}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{app.email}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Applied: {formatDate(app.createdAt)}</span>
                    <span>Type: <span className="capitalize">{app.membershipType}</span></span>
                    {app.referredBy && <span>Referred by: {app.referredBy}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(app)}
                  className="text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Review Application</h2>
                <p className="text-sm text-gray-500">{selectedApp.firstName} {selectedApp.lastName}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{selectedApp.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{selectedApp.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Membership Type</span>
                <span className="font-medium capitalize">{selectedApp.membershipType}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Applied On</span>
                <span className="font-medium">{formatDate(selectedApp.createdAt)}</span>
              </div>
              {selectedApp.referredBy && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Referred By</span>
                  <span className="font-medium">{selectedApp.referredBy}</span>
                </div>
              )}
              {selectedApp.notes && (
                <div className="py-2">
                  <span className="text-gray-500 block mb-1">Notes</span>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedApp.notes}</p>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Current Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedApp.status]}`}>
                  {selectedApp.status}
                </span>
              </div>
            </div>

            {selectedApp.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selectedApp.id, 'reject')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(selectedApp.id, 'waitlist')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                >
                  Waitlist
                </button>
                <button
                  onClick={() => handleAction(selectedApp.id, 'approve')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Approve'}
                </button>
              </div>
            )}

            {selectedApp.status !== 'pending' && (
              <div className="text-center text-sm text-gray-500">
                This application has already been {selectedApp.status}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
