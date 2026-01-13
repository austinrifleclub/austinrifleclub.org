/**
 * Combined Range Status Component
 *
 * Shows range status with clickable letter boxes at top
 * and detailed range cards below with all info.
 */

import { useState, useEffect, useRef } from 'react';
import { OpenIcon, EventIcon, ClosedIcon, MaintenanceIcon } from './ui/RangeStatusIcons';
import { API_BASE } from '../lib/api';

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

interface RangeInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  allowedFirearms: string[];
  maxCaliber: string;
}

const rangeDetails: RangeInfo[] = [
  {
    id: 'A',
    name: 'Pistol Range A',
    description: '25-yard pistol range with 20 covered shooting positions.',
    features: ['Covered positions', 'Target carriers', 'Bench rest available'],
    allowedFirearms: ['Handguns', 'Rimfire rifles'],
    maxCaliber: '.45 ACP / 10mm',
  },
  {
    id: 'B',
    name: 'Pistol Range B',
    description: '50-yard pistol range with 10 covered shooting positions.',
    features: ['Covered positions', 'Steel targets at 50yd'],
    allowedFirearms: ['Handguns', 'Rimfire rifles'],
    maxCaliber: '.45 ACP / 10mm',
  },
  {
    id: 'C',
    name: 'Rifle Range',
    description: '100/200-yard rifle range with covered firing line.',
    features: ['100yd & 200yd berms', 'Benchrest positions', 'Prone positions'],
    allowedFirearms: ['All rifles', 'Shotguns (slugs)'],
    maxCaliber: '.50 BMG (with approval)',
  },
  {
    id: 'D',
    name: '.22 Silhouette',
    description: 'Metallic silhouette range for .22 rimfire.',
    features: ['Steel silhouettes', 'Multiple distance lines'],
    allowedFirearms: ['.22 rimfire only'],
    maxCaliber: '.22 LR',
  },
  {
    id: 'E',
    name: 'Pistol Silhouette',
    description: 'Metallic silhouette range for handguns.',
    features: ['Steel silhouettes', 'Production & Revolver classes'],
    allowedFirearms: ['Handguns'],
    maxCaliber: '.44 Magnum',
  },
  {
    id: 'F',
    name: 'Air Gun Range',
    description: 'Indoor 10-meter air gun range.',
    features: ['Climate controlled', 'Electronic targets', 'Equipment available'],
    allowedFirearms: ['Air rifles', 'Air pistols'],
    maxCaliber: '.177',
  },
  {
    id: 'G',
    name: 'Education Center',
    description: 'Classroom and training facility.',
    features: ['Classroom seating', 'A/V equipment', 'NRA courses held here'],
    allowedFirearms: ['Training only'],
    maxCaliber: 'N/A',
  },
  {
    id: 'H',
    name: 'Action Bay H',
    description: 'Multi-purpose action shooting bay.',
    features: ['Steel targets', '180° shooting', 'IDPA/USPSA compatible'],
    allowedFirearms: ['Handguns', 'PCC'],
    maxCaliber: '.45 ACP',
  },
  {
    id: 'I',
    name: 'Action Bay I',
    description: 'Multi-purpose action shooting bay.',
    features: ['Steel targets', '180° shooting', 'IDPA/USPSA compatible'],
    allowedFirearms: ['Handguns', 'PCC'],
    maxCaliber: '.45 ACP',
  },
  {
    id: 'J',
    name: 'Action Bay J',
    description: 'Large action shooting bay for matches.',
    features: ['Extra large bay', 'Steel & paper targets', 'Club matches held here'],
    allowedFirearms: ['Handguns', 'PCC', 'Shotguns'],
    maxCaliber: '.45 ACP',
  },
  {
    id: 'K',
    name: 'Action Bay K',
    description: 'Multi-purpose action shooting bay.',
    features: ['Steel targets', '180° shooting'],
    allowedFirearms: ['Handguns', 'PCC'],
    maxCaliber: '.45 ACP',
  },
  {
    id: 'L',
    name: 'Multi-Purpose',
    description: 'Long-range capable multi-purpose bay.',
    features: ['300yd+ capability', 'Steel & reactive targets'],
    allowedFirearms: ['All firearms'],
    maxCaliber: 'Contact RSO',
  },
];

const statusLabels: Record<string, string> = {
  open: 'Open',
  event: 'Event in Progress',
  closed: 'Closed',
  maintenance: 'Maintenance',
};

const StatusIcon = ({ status, size = 20 }: { status: string; size?: number }) => {
  switch (status) {
    case 'open': return <OpenIcon size={size} />;
    case 'event': return <EventIcon size={size} />;
    case 'closed': return <ClosedIcon size={size} />;
    case 'maintenance': return <MaintenanceIcon size={size} />;
    default: return null;
  }
};

function LetterBox({
  rangeId,
  status,
  onClick
}: {
  rangeId: string;
  status: 'open' | 'event' | 'closed' | 'maintenance';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`range-letter-box status-${status}`}
      title={`Range ${rangeId} - ${statusLabels[status]}`}
    >
      {rangeId}
    </button>
  );
}

function RangeCard({
  status,
  info
}: {
  status: RangeStatus;
  info: RangeInfo;
}) {
  const isOpen = status.status === 'open';
  const isUnavailable = status.status === 'closed' || status.status === 'maintenance';

  return (
    <div
      id={`range-${status.id}`}
      className={`range-card ${isUnavailable ? 'unavailable' : 'available'}`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`range-id-box ${isOpen ? `status-${status.status}` : 'inactive'}`}>
              {status.id}
            </div>
            <div>
              <h3 className={`font-bold text-lg ${isUnavailable ? 'text-muted' : 'text-primary'}`}>
                {info.name}
              </h3>
              <p className={`text-sm ${isUnavailable ? 'text-muted' : 'text-secondary'}`}>
                {info.description}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`status-badge status-${status.status}`}>
            {isOpen && <span className="pulse-dot text-white" />}
            {statusLabels[status.status]}
          </div>
        </div>

        {/* Status Note */}
        {!isOpen && status.statusNote && (
          <p className={`mt-3 text-sm italic status-text-${status.status}`}>
            {status.statusNote}
          </p>
        )}

        {/* Event Info */}
        {status.linkedEvent && (
          <div className="mt-3 flex items-center gap-2 status-text-event text-sm">
            <EventIcon size={16} />
            <span>{status.linkedEvent.title}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">until {new Date(status.linkedEvent.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
          </div>
        )}

        {/* Range Details */}
        <div className={`grid md:grid-cols-3 gap-4 text-sm mt-5 ${isUnavailable ? 'opacity-60' : ''}`}>
          <div>
            <h4 className="font-medium text-primary mb-2">Features</h4>
            <ul className="text-secondary space-y-1">
              {info.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-1">
                  <span className={isOpen ? "text-success-accent" : "text-muted"}>✓</span> {feature}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-primary mb-2">Allowed</h4>
            <ul className="text-secondary space-y-1">
              {info.allowedFirearms.map((firearm, i) => (
                <li key={i}>{firearm}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-primary mb-2">Max Caliber</h4>
            <p className="text-secondary">{info.maxCaliber}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RangeStatusCombined() {
  const [ranges, setRanges] = useState<RangeStatus[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/range-status`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRanges(data.ranges);
      const updated = new Date(data.lastUpdated);
      setLastUpdated(updated.getFullYear() > 2000 ? updated : new Date());
      setError(null);
    } catch {
      setError('Unable to load range status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setIsScrolled(rect.top <= 64);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToRange = (id: string) => {
    const element = document.getElementById(`range-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner lg" />
        <p className="mt-4 text-secondary font-medium">Loading range status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="alert alert-error max-w-md">
          <ClosedIcon size={48} className="mx-auto mb-4" />
          <p className="font-medium mb-4">{error}</p>
          <button onClick={fetchStatus} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statusMap = new Map(ranges.map(r => [r.id, r]));

  return (
    <div>
      {/* Letter Boxes Navigation */}
      <div
        ref={navRef}
        className={`sticky-nav mb-8 ${isScrolled ? 'scrolled' : ''}`}
      >
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {rangeDetails.map((info) => {
            const status = statusMap.get(info.id);
            if (!status) return null;
            return (
              <LetterBox
                key={info.id}
                rangeId={info.id}
                status={status.status}
                onClick={() => scrollToRange(info.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Range Cards */}
      <div className="space-y-4">
        {rangeDetails.map((info) => {
          const status = statusMap.get(info.id);
          if (!status) return null;
          return (
            <RangeCard
              key={info.id}
              status={status}
              info={info}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-sm text-muted">
        <p className="flex items-center justify-center gap-2">
          <span className="pulse-dot status-text-open" />
          Last updated: {lastUpdated?.toLocaleString() || 'Unknown'}
        </p>
        <p className="mt-2">
          Auto-refreshes every minute •{' '}
          <button onClick={fetchStatus} className="link-accent font-medium">
            Refresh now
          </button>
        </p>
      </div>
    </div>
  );
}
