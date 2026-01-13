/**
 * Range Status Display Component
 *
 * Real-time display of all range statuses.
 * This is a key feature - members check this before driving to the club.
 *
 * @see features.md Section 5.2 for requirements
 */

import { useState, useEffect } from 'react';
import { OpenIcon, EventIcon, ClosedIcon, MaintenanceIcon, StatusDot } from './ui/RangeStatusIcons';

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
    color: 'bg-forest-600',
    textColor: 'text-forest-700 dark:text-green-400',
    bgColor: 'bg-forest-50 dark:bg-green-900/20',
    borderColor: 'border-forest-200 dark:border-green-800',
    icon: OpenIcon,
  },
  event: {
    label: 'Event',
    color: 'bg-steel-600',
    textColor: 'text-steel-600 dark:text-blue-400',
    bgColor: 'bg-steel-100 dark:bg-blue-900/20',
    borderColor: 'border-steel-200 dark:border-blue-800',
    icon: EventIcon,
  },
  closed: {
    label: 'Closed',
    color: 'bg-safety-600',
    textColor: 'text-safety-600 dark:text-red-400',
    bgColor: 'bg-safety-100 dark:bg-red-900/20',
    borderColor: 'border-safety-200 dark:border-red-800',
    icon: ClosedIcon,
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-earth-700',
    textColor: 'text-earth-800 dark:text-amber-400',
    bgColor: 'bg-earth-50 dark:bg-amber-900/20',
    borderColor: 'border-earth-200 dark:border-amber-800',
    icon: MaintenanceIcon,
  },
};

function RangeCard({ range }: { range: RangeStatus }) {
  const config = statusConfig[range.status];
  const StatusIcon = config.icon;
  const updatedAt = new Date(range.updatedAt);

  return (
    <div className={`card rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-5 transition-all hover:shadow-card-hover`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.color} text-white`}>
            <StatusIcon size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">{range.id}</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400">{range.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={range.status} />
          <span className={`text-sm font-semibold ${config.textColor}`}>
            {config.label}
          </span>
        </div>
      </div>

      {range.statusNote && (
        <p className={`text-sm ${config.textColor} mt-3 pl-12`}>
          {range.statusNote}
        </p>
      )}

      {range.linkedEvent && (
        <div className="mt-3 pl-12 text-sm bg-white/50 dark:bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <EventIcon size={16} className="text-steel-600 dark:text-blue-400" />
            <span className="font-semibold text-stone-800 dark:text-white">{range.linkedEvent.title}</span>
          </div>
          <p className="text-stone-500 dark:text-stone-400 mt-1">
            Until {new Date(range.linkedEvent.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
      )}

      {range.expiresAt && !range.linkedEvent && (
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 pl-12">
          Until {new Date(range.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </p>
      )}

      <p className="text-xs text-stone-400 dark:text-stone-500 mt-3 pl-12">
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

  const summaryItems = [
    { status: 'open' as const, count: counts.open, label: 'Open', Icon: OpenIcon, color: 'text-forest-700 dark:text-green-400', bg: 'bg-forest-100 dark:bg-green-900/30' },
    { status: 'event' as const, count: counts.event, label: 'Event', Icon: EventIcon, color: 'text-steel-600 dark:text-blue-400', bg: 'bg-steel-100 dark:bg-blue-900/30' },
    { status: 'closed' as const, count: counts.closed, label: 'Closed', Icon: ClosedIcon, color: 'text-safety-600 dark:text-red-400', bg: 'bg-safety-100 dark:bg-red-900/30' },
    { status: 'maintenance' as const, count: counts.maintenance, label: 'Maintenance', Icon: MaintenanceIcon, color: 'text-earth-700 dark:text-amber-400', bg: 'bg-earth-100 dark:bg-amber-900/30' },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {summaryItems.map(({ status, count, label, Icon, color, bg }) => (
        <div
          key={status}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${bg} transition-transform hover:scale-105`}
        >
          <Icon size={18} className={color} />
          <span className={`text-sm font-semibold ${color}`}>
            {count} {label}
          </span>
        </div>
      ))}
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
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--color-border)]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-navy-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-secondary font-medium">Loading range status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="alert alert-error max-w-md mx-auto p-8">
          <ClosedIcon size={48} className="mx-auto mb-4" />
          <p className="font-medium mb-4">{error}</p>
          <button
            onClick={fetchStatus}
            className="btn btn-primary px-6 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <StatusSummary ranges={ranges} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ranges.map((range) => (
          <RangeCard key={range.id} range={range} />
        ))}
      </div>

      <div className="text-center mt-10 text-sm text-muted">
        <p className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success-600 animate-pulse"></span>
          Last updated: {lastUpdated?.toLocaleString() || 'Unknown'}
        </p>
        <p className="mt-2">
          Auto-refreshes every minute •{' '}
          <button
            onClick={fetchStatus}
            className="link-accent font-medium"
          >
            Refresh now
          </button>
        </p>
      </div>
    </div>
  );
}
