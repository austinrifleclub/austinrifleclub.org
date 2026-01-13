/**
 * Settings Manager Component
 *
 * Admin interface for club-wide settings.
 */

import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface Setting {
  key: string;
  value: string;
  description: string | null;
}

const settingGroups = [
  {
    title: 'Membership Fees',
    keys: ['dues_individual', 'dues_family', 'dues_life'],
    descriptions: {
      dues_individual: 'Annual dues for individual membership',
      dues_family: 'Annual dues for family membership',
      dues_life: 'One-time dues for life membership',
    },
  },
  {
    title: 'Club Settings',
    keys: ['site_name', 'referral_credit', 'guest_visit_limit'],
    descriptions: {
      site_name: 'Name of the club',
      referral_credit: 'Credit amount for successful referrals ($)',
      guest_visit_limit: 'Max visits per guest per year before membership required',
    },
  },
];

export default function SettingsManager() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchSettings = async () => {
    try {
      // In a real implementation, this would fetch from an API endpoint
      // For now, use the seeded values
      setSettings({
        site_name: 'Austin Rifle Club',
        dues_individual: '150',
        dues_family: '200',
        dues_life: '1500',
        referral_credit: '25',
        guest_visit_limit: '3',
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    setMessage(null);

    try {
      // In a real implementation, this would POST to an API endpoint
      // Simulating a successful save
      await new Promise(resolve => setTimeout(resolve, 500));

      setSettings(prev => ({ ...prev, [key]: value }));
      setMessage({ type: 'success', text: 'Setting updated successfully' });
      setEditingKey(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update setting' });
    } finally {
      setSaving(null);
    }
  };

  const startEdit = (key: string) => {
    setEditingKey(key);
    setEditValue(settings[key] || '');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {settingGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{group.title}</h2>
            <div className="space-y-4">
              {group.keys.map((key) => {
                const isEditing = editingKey === key;
                const description = group.descriptions[key as keyof typeof group.descriptions];

                return (
                  <div key={key} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </label>
                      {description && (
                        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            onClick={cancelEdit}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSave(key, editValue)}
                            disabled={saving === key}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                          >
                            {saving === key ? 'Saving...' : 'Save'}
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-900 font-medium">
                            {key.includes('dues') || key === 'referral_credit'
                              ? `$${settings[key]}`
                              : settings[key]}
                          </span>
                          <button
                            onClick={() => startEdit(key)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
          <h2 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Export All Data</p>
                <p className="text-sm text-gray-500">Download a backup of all club data</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Export
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Clear Event History</p>
                <p className="text-sm text-gray-500">Remove all past events (keeps future events)</p>
              </div>
              <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                Clear History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
