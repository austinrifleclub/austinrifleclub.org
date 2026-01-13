/**
 * Permissions Page Component
 *
 * Fetches member data to determine edit permissions for RACI matrix.
 * Only President and Secretary can edit the matrix.
 */

import { useState, useEffect } from 'react';
import RACIMatrix from './RACIMatrix';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

// Board positions that can edit the RACI matrix
const RACI_EDITORS = ['president', 'secretary'];

interface BoardPosition {
  positionId: string;
  title: string;
}

interface MemberProfile {
  id: string;
  boardPosition: BoardPosition | null;
}

export default function PermissionsPage() {
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/members/me`, {
          credentials: 'include',
        });

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const member: MemberProfile | null = await res.json();

        if (member?.boardPosition) {
          // Check if position ID matches allowed editors
          const positionId = member.boardPosition.positionId.toLowerCase();
          setCanEdit(RACI_EDITORS.includes(positionId));
        }
      } catch (err) {
        console.error('Failed to check permissions:', err);
        setError('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const handleSave = async (data: unknown) => {
    // For now, just log - GitHub integration will be added later
    console.log('Saving RACI matrix:', data);
    alert('Save functionality coming soon! Changes will be committed to GitHub.');
  };

  return (
    <RACIMatrix
      canEdit={canEdit}
      onSave={canEdit ? handleSave : undefined}
    />
  );
}
