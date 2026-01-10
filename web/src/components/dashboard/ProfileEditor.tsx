/**
 * Profile Editor Component
 *
 * Allows members to view and update their profile information.
 */

import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface MemberProfile {
  id: string;
  badgeNumber: string | null;
  membershipType: string;
  status: string;
  firstName: string;
  lastName: string;
  expirationDate: string | null;
  volunteerCreditBalance: number;
  duesCurrent: boolean;
  inGracePeriod: boolean;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  nraNumber?: string;
}

export default function ProfileEditor() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [nraNumber, setNraNumber] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/members/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          // Initialize form fields
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setCity(data.city || '');
          setState(data.state || '');
          setZip(data.zip || '');
          setEmergencyContact(data.emergencyContact || '');
          setEmergencyPhone(data.emergencyPhone || '');
          setNraNumber(data.nraNumber || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/members/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phone,
          address,
          city,
          state,
          zip,
          emergencyContact,
          emergencyPhone,
          nraNumber,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="profile">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="profile">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Read-only Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Membership Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Member Name</label>
              <p className="font-medium">{profile?.firstName} {profile?.lastName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Badge Number</label>
              <p className="font-medium">{profile?.badgeNumber || 'Pending'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Membership Type</label>
              <p className="font-medium">{profile?.membershipType}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p className={`font-medium ${profile?.duesCurrent ? 'text-green-600' : 'text-red-600'}`}>
                {profile?.duesCurrent ? 'Active' : profile?.inGracePeriod ? 'Grace Period' : 'Expired'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Expiration Date</label>
              <p className="font-medium">
                {profile?.expirationDate
                  ? new Date(profile.expirationDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Volunteer Credits</label>
              <p className="font-medium">${profile?.volunteerCreditBalance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="font-semibold text-lg mb-4">Contact Information</h2>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="(512) 555-1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NRA Number (Optional)
              </label>
              <input
                type="text"
                value={nraNumber}
                onChange={(e) => setNraNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="NRA membership number"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Austin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="TX"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="78701"
              />
            </div>
          </div>

          <h3 className="font-medium text-gray-900 mb-3">Emergency Contact</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="(512) 555-5678"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
