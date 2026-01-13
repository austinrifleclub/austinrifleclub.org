/**
 * Event Access Control Tests
 *
 * Unit tests for event visibility and registration access control.
 */

import { describe, it, expect } from 'vitest';
import { canViewEvent, canRegisterForEvent, getMissingCertificationNames, type AccessContext } from './eventAccess';
import type { Event, Member, Certification } from '../db/schema';

// Helper to create mock events
function createMockEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'event-1',
    title: 'Test Event',
    description: null,
    eventType: 'match',
    mecPostId: null,
    templateId: null,
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    location: 'Range A',
    maxParticipants: 20,
    cost: 25,
    status: 'published',
    isPublic: false,
    membersOnly: true,
    boardOnly: false,
    requiresCertification: null,
    rangeIds: null,
    recurrenceRule: null,
    recurrenceParentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Event;
}

// Helper to create mock members
function createMockMember(overrides: Partial<Member> = {}): Member {
  return {
    id: 'member-1',
    userId: 'user-1',
    badgeNumber: 'M0001',
    membershipType: 'individual',
    status: 'active',
    firstName: 'Test',
    lastName: 'User',
    phone: '+15551234567',
    addressLine1: '123 Test St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    emergencyContactName: 'Emergency Contact',
    emergencyContactPhone: '+15559876543',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Member;
}

// Helper to create access contexts
function createContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    user: { id: 'user-1' },
    member: createMockMember(),
    memberCertifications: [],
    isBoardMember: false,
    ...overrides,
  };
}

describe('canViewEvent', () => {
  it('allows anyone to view public events', () => {
    const event = createMockEvent({ isPublic: true });
    const ctx = createContext({ user: null, member: null });

    expect(canViewEvent(event, ctx)).toBe(true);
  });

  it('denies unauthenticated users from viewing non-public events', () => {
    const event = createMockEvent({ isPublic: false });
    const ctx = createContext({ user: null, member: null });

    expect(canViewEvent(event, ctx)).toBe(false);
  });

  it('allows board members to view board-only events', () => {
    const event = createMockEvent({ boardOnly: true });
    const ctx = createContext({ isBoardMember: true });

    expect(canViewEvent(event, ctx)).toBe(true);
  });

  it('denies non-board members from viewing board-only events', () => {
    const event = createMockEvent({ boardOnly: true });
    const ctx = createContext({ isBoardMember: false });

    expect(canViewEvent(event, ctx)).toBe(false);
  });

  it('allows active members to view members-only events', () => {
    const event = createMockEvent({ membersOnly: true, isPublic: false });
    const ctx = createContext({ member: createMockMember({ status: 'active' }) });

    expect(canViewEvent(event, ctx)).toBe(true);
  });

  it('allows probationary members to view members-only events', () => {
    const event = createMockEvent({ membersOnly: true, isPublic: false });
    const ctx = createContext({ member: createMockMember({ status: 'probationary' }) });

    expect(canViewEvent(event, ctx)).toBe(true);
  });

  it('denies suspended members from viewing members-only events', () => {
    const event = createMockEvent({ membersOnly: true, isPublic: false });
    const ctx = createContext({ member: createMockMember({ status: 'suspended' }) });

    expect(canViewEvent(event, ctx)).toBe(false);
  });

  it('allows prospects to view orientation events', () => {
    const event = createMockEvent({ eventType: 'arc_education', isPublic: false });
    const ctx = createContext({ member: createMockMember({ status: 'prospect' }) });

    expect(canViewEvent(event, ctx)).toBe(true);
  });

  it('denies prospects from viewing non-orientation events', () => {
    const event = createMockEvent({ eventType: 'match', isPublic: false });
    const ctx = createContext({ member: createMockMember({ status: 'prospect' }) });

    expect(canViewEvent(event, ctx)).toBe(false);
  });
});

describe('canRegisterForEvent', () => {
  it('requires authentication for registration', () => {
    const event = createMockEvent({ isPublic: true });
    const ctx = createContext({ user: null, member: null });

    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(false);
    expect(result.reason).toContain('log in');
  });

  it('requires member profile for registration', () => {
    const event = createMockEvent({ isPublic: true });
    const ctx = createContext({ member: null });

    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(false);
    expect(result.reason).toContain('member profile');
  });

  it('blocks suspended members from registration', () => {
    const event = createMockEvent({ isPublic: true });
    const ctx = createContext({ member: createMockMember({ status: 'suspended' }) });

    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(false);
    expect(result.reason).toContain('suspended');
  });

  it('blocks terminated members from registration', () => {
    const event = createMockEvent({ isPublic: true });
    const ctx = createContext({ member: createMockMember({ status: 'terminated' }) });

    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(false);
    expect(result.reason).toContain('terminated');
  });

  it('blocks inactive members from registration', () => {
    const event = createMockEvent({ isPublic: true });
    const ctx = createContext({ member: createMockMember({ status: 'inactive' }) });

    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(false);
    expect(result.reason).toContain('inactive');
  });

  it('blocks prospects from members-only events', () => {
    const event = createMockEvent({ membersOnly: true, isPublic: true });
    const ctx = createContext({ member: createMockMember({ status: 'prospect' }) });

    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(false);
    expect(result.reason).toContain('approved members');
  });

  it('allows active members to register for members-only events', () => {
    const event = createMockEvent({ membersOnly: true, isPublic: true });
    const ctx = createContext({ member: createMockMember({ status: 'active' }) });

    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(true);
    expect(result.reason).toBeNull();
  });

  it('checks required certifications', () => {
    const event = createMockEvent({
      isPublic: true,
      membersOnly: false,
      requiresCertification: '["cert-type-rso"]',
    });
    const ctx = createContext({
      member: createMockMember({ status: 'active' }),
      memberCertifications: [],
    });

    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(false);
    expect(result.reason).toContain('certifications');
    expect(result.missingCertifications).toContain('cert-type-rso');
  });

  it('allows registration when member has required certifications', () => {
    const event = createMockEvent({
      isPublic: true,
      membersOnly: false,
      requiresCertification: '["cert-type-rso"]',
    });
    const ctx = createContext({
      member: createMockMember({ status: 'active' }),
      memberCertifications: [
        {
          id: 'cert-1',
          memberId: 'member-1',
          certificationTypeId: 'cert-type-rso',
          earnedDate: new Date(),
          expiresAt: null,
          verifiedBy: null,
          verifiedAt: null,
          documentUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Certification,
      ],
    });

    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(true);
  });

  it('handles expired certifications', () => {
    const event = createMockEvent({
      isPublic: true,
      membersOnly: false,
      requiresCertification: '["cert-type-rso"]',
    });
    const ctx = createContext({
      member: createMockMember({ status: 'active' }),
      memberCertifications: [
        {
          id: 'cert-1',
          memberId: 'member-1',
          certificationTypeId: 'cert-type-rso',
          earnedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() - 1000), // Expired
          verifiedBy: null,
          verifiedAt: null,
          documentUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Certification,
      ],
    });

    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(false);
    expect(result.missingCertifications).toContain('cert-type-rso');
  });

  it('handles malformed JSON in requiresCertification', () => {
    const event = createMockEvent({
      isPublic: true,
      membersOnly: false,
      requiresCertification: 'invalid-json',
    });
    const ctx = createContext({ member: createMockMember({ status: 'active' }) });

    // Should not throw, should allow registration
    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(true);
  });

  it('handles non-array JSON in requiresCertification', () => {
    const event = createMockEvent({
      isPublic: true,
      membersOnly: false,
      requiresCertification: '{"not": "an array"}',
    });
    const ctx = createContext({ member: createMockMember({ status: 'active' }) });

    // Should not throw, should allow registration
    const result = canRegisterForEvent(event, ctx);
    expect(result.canRegister).toBe(true);
  });
});

describe('getMissingCertificationNames', () => {
  it('maps certification IDs to human-readable names', () => {
    const names = getMissingCertificationNames(['cert-type-nmo', 'cert-type-rso']);

    expect(names).toContain('New Member Orientation (NMO)');
    expect(names).toContain('Range Safety Officer (RSO)');
  });

  it('returns the ID for unknown certifications', () => {
    const names = getMissingCertificationNames(['unknown-cert']);

    expect(names).toContain('unknown-cert');
  });
});
