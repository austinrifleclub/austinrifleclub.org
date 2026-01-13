/**
 * Profile Editor Component
 *
 * Allows members to view and update their profile information.
 */

import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { API_BASE } from '../../lib/api';

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
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  vehicleDescription?: string;
  licensePlate?: string;
}

export default function ProfileEditor() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields - must match API schema (updateMemberSchema)
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [vehicleDescription, setVehicleDescription] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

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
          setAddressLine1(data.addressLine1 || '');
          setAddressLine2(data.addressLine2 || '');
          setCity(data.city || '');
          setState(data.state || '');
          setZip(data.zip || '');
          setEmergencyContactName(data.emergencyContactName || '');
          setEmergencyContactPhone(data.emergencyContactPhone || '');
          setVehicleDescription(data.vehicleDescription || '');
          setLicensePlate(data.licensePlate || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
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
          phone: phone || undefined,
          addressLine1: addressLine1 || undefined,
          addressLine2: addressLine2 || undefined,
          city: city || undefined,
          state: state || undefined,
          zip: zip || undefined,
          emergencyContactName: emergencyContactName || undefined,
          emergencyContactPhone: emergencyContactPhone || undefined,
          vehicleDescription: vehicleDescription || undefined,
          licensePlate: licensePlate || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || errorData.error || 'Failed to update profile';
        throw new Error(errorMsg);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="profile">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="profile">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">My Profile</h1>

        {/* Read-only Info */}
        <div className="dashboard-section mb-6">
          <h2 className="dashboard-section-title mb-4">Membership Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted">Member Name</label>
              <p className="font-medium text-primary">{profile?.firstName} {profile?.lastName}</p>
            </div>
            <div>
              <label className="text-sm text-muted">Badge Number</label>
              <p className="font-medium text-primary">{profile?.badgeNumber || 'Pending'}</p>
            </div>
            <div>
              <label className="text-sm text-muted">Membership Type</label>
              <p className="font-medium text-primary">{profile?.membershipType}</p>
            </div>
            <div>
              <label className="text-sm text-muted">Status</label>
              <p className={`font-medium ${profile?.duesCurrent ? 'text-success-accent' : 'text-danger-accent'}`}>
                {profile?.duesCurrent ? 'Active' : profile?.inGracePeriod ? 'Grace Period' : 'Expired'}
              </p>
            </div>
            <div>
              <label className="text-sm text-muted">Expiration Date</label>
              <p className="font-medium text-primary">
                {profile?.expirationDate
                  ? new Date(profile.expirationDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-muted">Volunteer Credits</label>
              <p className="font-medium text-primary">${profile?.volunteerCreditBalance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSave} className="dashboard-section">
          <h2 className="dashboard-section-title mb-4">Contact Information</h2>

          {message && (
            <div className={`mb-4 alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input w-full"
                placeholder="(512) 555-1234"
              />
            </div>

          </div>

          <div className="mb-4">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="form-input w-full"
              placeholder="123 Main St"
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className="form-input w-full"
              placeholder="Apt, Suite, Unit, etc."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-input w-full"
                placeholder="Austin"
              />
            </div>
            <div>
              <label className="form-label">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="form-input w-full"
                placeholder="TX"
                maxLength={2}
              />
            </div>
            <div>
              <label className="form-label">ZIP Code</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="form-input w-full"
                placeholder="78701"
              />
            </div>
          </div>

          <h3 className="font-medium text-primary mb-3">Emergency Contact</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="form-label">Contact Name</label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="form-input w-full"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="form-input w-full"
                placeholder="(512) 555-5678"
              />
            </div>
          </div>

          <h3 className="font-medium text-primary mb-3">Vehicle Information (Optional)</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="form-label">Vehicle Description</label>
              <input
                type="text"
                value={vehicleDescription}
                onChange={(e) => setVehicleDescription(e.target.value)}
                className="form-input w-full"
                placeholder="Blue Ford F-150"
              />
            </div>
            <div>
              <label className="form-label">License Plate</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="form-input w-full"
                placeholder="ABC-1234"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
