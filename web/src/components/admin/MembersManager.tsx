/**
 * Members Manager Component
 *
 * Admin interface for viewing and managing members.
 */

import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface Member {
  id: string;
  memberId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  membershipType: string;
  membershipStatus: string;
  memberSince: string | null;
  expiresAt: string | null;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-blue-100 text-blue-800',
};

export default function MembersManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`${API_BASE}/api/members?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search, statusFilter]);

  const handleStatusChange = async (memberId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipStatus: newStatus }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Member status updated' });
        fetchMembers();
        setSelectedMember(null);
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update member status' });
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
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
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <div className="text-sm text-gray-500">
          {members.length} total members
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or member ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {member.memberId || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                    {member.membershipType}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[member.membershipStatus] || 'bg-gray-100 text-gray-800'}`}>
                      {member.membershipStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(member.expiresAt)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="text-green-600 hover:text-green-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedMember.firstName} {selectedMember.lastName}</h2>
                <p className="text-sm text-gray-500">{selectedMember.email}</p>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Member ID</span>
                <span className="font-medium">{selectedMember.memberId || 'Not assigned'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{selectedMember.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Membership Type</span>
                <span className="font-medium capitalize">{selectedMember.membershipType}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedMember.membershipStatus]}`}>
                  {selectedMember.membershipStatus}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Member Since</span>
                <span className="font-medium">{formatDate(selectedMember.memberSince)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Expires</span>
                <span className="font-medium">{formatDate(selectedMember.expiresAt)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Change Status</label>
              <div className="flex gap-2">
                {['active', 'suspended', 'expired'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedMember.id, status)}
                    disabled={selectedMember.membershipStatus === status}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      selectedMember.membershipStatus === status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
