/**
 * Range Status Display Component
 *
 * Real-time display of all range statuses.
 * This is a key feature - members check this before driving to the club.
 *
 * @see features.md Section 5.2 for requirements
 */

import { useState, useEffect } from 'react';

interface RangeStatus {
  id: string;
  name: string;
  description: string | null;
  status: 'open' | 'event' | 'closed' | 'maintenance';
  statusNote: string | null;
  expiresAt: string | null;
  updatedAt: string;
  linkedEvent?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  } | null;
}

interface RangeStatusResponse {
  ranges: RangeStatus[];
  lastUpdated: string;
}

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

const statusConfig = {
  open: {
    label: 'Open',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  event: {
    label: 'Event',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  closed: {
    label: 'Closed',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
};

function RangeCard({ range }: { range: RangeStatus }) {
  const config = statusConfig[range.status];
  const updatedAt = new Date(range.updatedAt);

  return (
    <div className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-4`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-lg">{range.id}</h3>
          <p className="text-sm text-gray-600">{range.name}</p>
        </div>
        <span className={`${config.color} text-white text-sm font-medium px-3 py-1 rounded-full`}>
          {config.label}
        </span>
      </div>

      {range.statusNote && (
        <p className={`text-sm ${config.textColor} mt-2`}>
          {range.statusNote}
        </p>
      )}

      {range.linkedEvent && (
        <div className="mt-2 text-sm">
          <span className="text-gray-500">Event: </span>
          <span className="font-medium">{range.linkedEvent.title}</span>
          <br />
          <span className="text-gray-500">
            Until {new Date(range.linkedEvent.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
      )}

      {range.expiresAt && !range.linkedEvent && (
        <p className="text-xs text-gray-500 mt-2">
          Until {new Date(range.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </p>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Updated {updatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </p>
    </div>
  );
}

function StatusSummary({ ranges }: { ranges: RangeStatus[] }) {
  const counts = {
    open: ranges.filter(r => r.status === 'open').length,
    event: ranges.filter(r => r.status === 'event').length,
    closed: ranges.filter(r => r.status === 'closed').length,
    maintenance: ranges.filter(r => r.status === 'maintenance').length,
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center mb-8">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-green-500"></div>
        <span className="text-sm">{counts.open} Open</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
        <span className="text-sm">{counts.event} Event</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-red-500"></div>
        <span className="text-sm">{counts.closed} Closed</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
        <span className="text-sm">{counts.maintenance} Maintenance</span>
      </div>
    </div>
  );
}

export default function RangeStatusDisplay() {
  const [ranges, setRanges] = useState<RangeStatus[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/range-status`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data: RangeStatusResponse = await response.json();
      setRanges(data.ranges);
      // Only set lastUpdated if it's a valid recent date (not Unix epoch)
      const updated = new Date(data.lastUpdated);
      if (updated.getFullYear() > 2000) {
        setLastUpdated(updated);
      } else {
        setLastUpdated(new Date());
      }
      setError(null);
    } catch (err) {
      setError('Unable to load range status. Please try again.');
      console.error('Failed to fetch range status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading range status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchStatus}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StatusSummary ranges={ranges} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ranges.map((range) => (
          <RangeCard key={range.id} range={range} />
        ))}
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        <p>
          Last updated: {lastUpdated?.toLocaleString() || 'Unknown'}
        </p>
        <p className="mt-1">
          Auto-refreshes every minute •{' '}
          <button
            onClick={fetchStatus}
            className="text-green-700 hover:text-green-800 underline"
          >
            Refresh now
          </button>
        </p>
      </div>
    </div>
  );
}
