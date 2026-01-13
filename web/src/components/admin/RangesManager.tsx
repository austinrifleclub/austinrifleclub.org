/**
 * Ranges Manager Component
 *
 * Admin interface for managing range statuses.
 */

import { useState, useEffect } from 'react';
import { API_BASE } from '../../lib/api';

interface Range {
  id: string;
  name: string;
  description: string | null;
  status: 'open' | 'event' | 'closed' | 'maintenance';
  statusNote: string | null;
  expiresAt: string | null;
  updatedAt: string;
}

const statusOptions = [
  { value: 'open', label: 'Open', color: 'bg-green-500' },
  { value: 'event', label: 'Event', color: 'bg-blue-500' },
  { value: 'closed', label: 'Closed', color: 'bg-red-500' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-500' },
];

export default function RangesManager() {
  const [ranges, setRanges] = useState<Range[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRange, setEditingRange] = useState<Range | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRanges = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/range-status`);
      if (response.ok) {
        const data = await response.json();
        setRanges(data.ranges);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanges();
  }, []);

  const handleSave = async () => {
    if (!editingRange) return;
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/range-status/${editingRange.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editingRange.status,
          statusNote: editingRange.statusNote,
          expiresAt: editingRange.expiresAt,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Range ${editingRange.id} updated successfully` });
        setEditingRange(null);
        fetchRanges();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update range status' });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (rangeId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/range-status/${rangeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Range ${rangeId} set to ${status}` });
        fetchRanges();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update range status' });
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Range Management</h1>
        <button
          onClick={() => {
            ranges.forEach(r => handleQuickStatus(r.id, 'open'));
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Open All Ranges
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ranges.map((range) => (
          <div key={range.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{range.id}</h3>
                <p className="text-sm text-gray-600">{range.name}</p>
              </div>
              <span className={`${statusOptions.find(s => s.value === range.status)?.color} text-white text-xs font-medium px-2 py-1 rounded-full`}>
                {statusOptions.find(s => s.value === range.status)?.label}
              </span>
            </div>

            {range.statusNote && (
              <p className="text-sm text-gray-500 mb-3">{range.statusNote}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleQuickStatus(range.id, status.value)}
                  className={`px-2 py-1 text-xs rounded ${
                    range.status === status.value
                      ? `${status.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setEditingRange(range)}
              className="text-sm text-green-700 hover:text-green-800 font-medium"
            >
              Edit Details
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingRange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Range {editingRange.id}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingRange.status}
                  onChange={(e) => setEditingRange({ ...editingRange, status: e.target.value as Range['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Note</label>
                <input
                  type="text"
                  value={editingRange.statusNote || ''}
                  onChange={(e) => setEditingRange({ ...editingRange, statusNote: e.target.value || null })}
                  placeholder="e.g., Target maintenance in progress"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                <input
                  type="datetime-local"
                  value={editingRange.expiresAt?.slice(0, 16) || ''}
                  onChange={(e) => setEditingRange({ ...editingRange, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingRange(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
