/**
 * Permissions & RACI Matrix Editor Component
 *
 * Displays two tables:
 * 1. Permissions Matrix - What each role CAN do (✓/✗)
 * 2. RACI Matrix - Who is Responsible, Accountable, Consulted, Informed for processes
 *
 * Uses AG Grid Community (MIT licensed) for the tables.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, CellClassParams, CellValueChangedEvent, CellClickedEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import raciData from '../../config/raci-matrix.json';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface RACIMatrixProps {
  canEdit?: boolean;
  onSave?: (data: typeof raciData) => Promise<void>;
}

type RACIValue = 'R' | 'A' | 'C' | 'I' | '-';

const RACI_CONFIG: Record<RACIValue, { label: string; color: string; bg: string }> = {
  'R': { label: 'Responsible', color: '#ffffff', bg: '#3b82f6' },
  'A': { label: 'Accountable', color: '#ffffff', bg: '#dc2626' },
  'C': { label: 'Consulted', color: '#ffffff', bg: '#f59e0b' },
  'I': { label: 'Informed', color: '#ffffff', bg: '#16a34a' },
  '-': { label: 'Not involved', color: '#9ca3af', bg: 'transparent' },
};

// Cell style function for RACI values
function getRACICellStyle(params: CellClassParams) {
  const value = (params.value as string)?.toUpperCase() as RACIValue;
  const config = RACI_CONFIG[value] || RACI_CONFIG['-'];

  // For '-' (not involved), don't set background - let it inherit
  if (value === '-') {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '0.875rem',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      color: '#9ca3af',
    };
  }

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.875rem',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    backgroundColor: config.bg,
    color: config.color,
    borderRadius: '6px',
  };
}

// Cell style function for Permissions (boolean) values
function getPermissionCellStyle(params: CellClassParams) {
  const value = params.value;
  const isGranted = value === '✓';

  if (isGranted) {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '1.125rem',
      backgroundColor: '#16a34a',
      color: '#ffffff',
    };
  }

  // For non-granted cells, don't set background - let it inherit from row
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.125rem',
    color: '#6b7280',
  };
}

// Format boolean to display character
function formatPermissionValue(value: boolean | string): string {
  if (value === true || value === '✓') return '✓';
  return '✗';
}

// Info popup state type
interface PopupInfo {
  title: string;
  description: string;
  x: number;
  y: number;
}

export default function RACIMatrix({ canEdit = false, onSave }: RACIMatrixProps) {
  const [data, setData] = useState(raciData);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [permissionCategoryFilter, setPermissionCategoryFilter] = useState<string>('all');
  const [responsibilityCategoryFilter, setResponsibilityCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'permissions' | 'members' | 'range' | 'board'>('permissions');

  // RACI tab category mappings
  const raciTabCategories = {
    members: ['membership', 'events'],
    range: ['safety', 'facilities'],
    board: ['finance', 'governance'],
  };
  const [mounted, setMounted] = useState(false);
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  // Only render on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset category filter when switching RACI tabs
  useEffect(() => {
    setResponsibilityCategoryFilter('all');
  }, [activeTab]);

  // Apply column highlighting on hover
  useEffect(() => {
    // Remove previous highlights
    document.querySelectorAll('.column-highlighted').forEach(el => {
      el.classList.remove('column-highlighted');
    });
    // Add highlight to hovered column cells (including category rows)
    if (hoveredColumn) {
      document.querySelectorAll(`.ag-cell[col-id="${hoveredColumn}"]`).forEach(el => {
        el.classList.add('column-highlighted');
      });
    }
  }, [hoveredColumn]);

  // Close popup when clicking outside
  useEffect(() => {
    if (!popup) return;
    const handleClick = () => setPopup(null);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopup(null);
    };
    // Delay to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleEscape);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [popup]);

  // Get filtered roles based on role group filter
  const filteredRoles = useMemo(() => {
    if (roleFilter === 'all') return data.roles;
    return data.roles.filter(r => r.group === roleFilter);
  }, [data.roles, roleFilter]);

  // Get filtered permissions based on category filter
  const filteredPermissions = useMemo(() => {
    if (permissionCategoryFilter === 'all') return data.permissions.items;
    return data.permissions.items.filter(a => a.category === permissionCategoryFilter);
  }, [data.permissions.items, permissionCategoryFilter]);

  // Get the categories for the current RACI tab
  const activeRaciCategories = useMemo(() => {
    if (activeTab === 'members') return raciTabCategories.members;
    if (activeTab === 'range') return raciTabCategories.range;
    if (activeTab === 'board') return raciTabCategories.board;
    return null; // permissions tab
  }, [activeTab]);

  // Get filtered responsibilities based on tab and category filter
  const filteredResponsibilities = useMemo(() => {
    let items = data.responsibilities.items;

    // First filter by active RACI tab categories
    if (activeRaciCategories) {
      items = items.filter(item => activeRaciCategories.includes(item.category));
    }

    // Then filter by category dropdown if not "all"
    if (responsibilityCategoryFilter !== 'all') {
      items = items.filter(item => item.category === responsibilityCategoryFilter);
    }

    return items;
  }, [data.responsibilities.items, activeRaciCategories, responsibilityCategoryFilter]);

  // Filter roles for RACI tabs - hide roles with no responsibilities (all "-")
  const filteredRolesForRaci = useMemo(() => {
    // Only filter for RACI tabs, not permissions
    if (!activeRaciCategories) return filteredRoles;

    const matrix = data.responsibilities.matrix as Record<string, Record<string, string>>;

    // Get responsibility IDs for the current tab's categories
    const tabResponsibilityIds = data.responsibilities.items
      .filter(item => activeRaciCategories.includes(item.category))
      .map(item => item.id);

    // Filter roles that have at least one non-"-" value for these responsibilities
    return filteredRoles.filter(role => {
      return tabResponsibilityIds.some(respId => {
        const value = matrix[respId]?.[role.id];
        return value && value !== '-';
      });
    });
  }, [filteredRoles, activeRaciCategories, data.responsibilities.matrix, data.responsibilities.items]);

  // Create lookup maps for descriptions
  const roleDescriptionMap = useMemo(() => {
    const map: Record<string, string> = {};
    data.roles.forEach(role => {
      map[role.id] = role.description || '';
    });
    return map;
  }, [data.roles]);

  const permissionDescriptionMap = useMemo(() => {
    const map: Record<string, string> = {};
    data.permissions.items.forEach(item => {
      map[item.id] = item.description || '';
    });
    return map;
  }, [data.permissions.items]);

  const responsibilityDescriptionMap = useMemo(() => {
    const map: Record<string, string> = {};
    data.responsibilities.items.forEach(item => {
      map[item.id] = item.description || '';
    });
    return map;
  }, [data.responsibilities.items]);

  // Show popup handler
  const showPopup = useCallback((title: string, description: string, element: HTMLElement) => {
    if (!description) return;
    const rect = element.getBoundingClientRect();
    setPopup({
      title,
      description,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  }, []);

  // Build column definitions for Permissions table
  const permissionColumnDefs = useMemo<ColDef[]>(() => {
    const cols: ColDef[] = [
      {
        field: 'permission',
        headerName: 'Permission',
        pinned: 'left',
        width: 240,
        minWidth: 200,
        cellClass: 'matrix-label-cell matrix-clickable-cell',
        editable: false,
        wrapText: true,
        autoHeight: true,
        tooltipValueGetter: (params) => {
          if (params.data?.isGroupRow) return null;
          return permissionDescriptionMap[params.data?.id] || null;
        },
        onCellClicked: (params: CellClickedEvent) => {
          if (params.data?.isGroupRow) return;
          const description = permissionDescriptionMap[params.data?.id];
          const target = params.event?.target as HTMLElement;
          if (description && target) {
            showPopup(params.data?.permission, description, target);
          }
        },
      },
    ];

    filteredRoles.forEach(role => {
      cols.push({
        field: role.id,
        headerName: role.name,
        headerTooltip: role.description || role.name,
        width: 48,
        minWidth: 40,
        maxWidth: 60,
        editable: canEdit,
        cellStyle: getPermissionCellStyle,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['✓', '✗'],
        },
        headerClass: 'matrix-header-cell matrix-clickable-header matrix-rotated-header',
        wrapHeaderText: false,
        autoHeaderHeight: false,
      });
    });

    return cols;
  }, [filteredRoles, canEdit, permissionDescriptionMap, showPopup]);

  // Build column definitions for RACI table
  const raciColumnDefs = useMemo<ColDef[]>(() => {
    const cols: ColDef[] = [
      {
        field: 'responsibility',
        headerName: 'Responsibility',
        pinned: 'left',
        width: 240,
        minWidth: 200,
        cellClass: 'matrix-label-cell matrix-clickable-cell',
        editable: false,
        wrapText: true,
        autoHeight: true,
        tooltipValueGetter: (params) => {
          if (params.data?.isGroupRow) return null;
          return responsibilityDescriptionMap[params.data?.id] || null;
        },
        onCellClicked: (params: CellClickedEvent) => {
          if (params.data?.isGroupRow) return;
          const description = responsibilityDescriptionMap[params.data?.id];
          const target = params.event?.target as HTMLElement;
          if (description && target) {
            showPopup(params.data?.responsibility, description, target);
          }
        },
      },
    ];

    filteredRolesForRaci.forEach(role => {
      cols.push({
        field: role.id,
        headerName: role.name,
        headerTooltip: role.description || role.name,
        width: 48,
        minWidth: 40,
        maxWidth: 60,
        editable: canEdit,
        cellStyle: getRACICellStyle,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['R', 'A', 'C', 'I', '-'],
        },
        headerClass: 'matrix-header-cell matrix-clickable-header matrix-rotated-header',
        wrapHeaderText: false,
        autoHeaderHeight: false,
      });
    });

    return cols;
  }, [filteredRolesForRaci, canEdit, responsibilityDescriptionMap, showPopup]);

  // Build row data for Permissions table with category grouping
  const permissionRowData = useMemo(() => {
    const rows: Record<string, string | boolean>[] = [];
    const categoryMap = new Map<string, typeof filteredPermissions>();

    // Group items by category
    filteredPermissions.forEach(item => {
      const existing = categoryMap.get(item.category) || [];
      categoryMap.set(item.category, [...existing, item]);
    });

    // Build rows with category headers
    const categories = data.permissions.categories;
    categories.forEach(cat => {
      const items = categoryMap.get(cat.id);
      if (!items || items.length === 0) return;

      // Add category header row
      const headerRow: Record<string, string | boolean> = {
        id: `category-${cat.id}`,
        permission: cat.name,
        isGroupRow: true,
      };
      rows.push(headerRow);

      // Add item rows
      items.forEach(item => {
        const row: Record<string, string | boolean> = {
          id: item.id,
          permission: item.name,
          isGroupRow: false,
        };

        filteredRoles.forEach(role => {
          const matrix = data.permissions.matrix as Record<string, Record<string, boolean>>;
          const value = matrix[item.id]?.[role.id] ?? false;
          row[role.id] = value ? '✓' : '✗';
        });

        rows.push(row);
      });
    });

    return rows;
  }, [filteredPermissions, filteredRoles, data.permissions.matrix, data.permissions.categories]);

  // Build row data for RACI table with category grouping
  const raciRowData = useMemo(() => {
    const rows: Record<string, string | boolean>[] = [];
    const categoryMap = new Map<string, typeof filteredResponsibilities>();

    // Group items by category
    filteredResponsibilities.forEach(item => {
      const existing = categoryMap.get(item.category) || [];
      categoryMap.set(item.category, [...existing, item]);
    });

    // Build rows with category headers
    const categories = data.responsibilities.categories;
    categories.forEach(cat => {
      const items = categoryMap.get(cat.id);
      if (!items || items.length === 0) return;

      // Add category header row
      const headerRow: Record<string, string | boolean> = {
        id: `category-${cat.id}`,
        responsibility: cat.name,
        isGroupRow: true,
      };
      rows.push(headerRow);

      // Add item rows
      items.forEach(item => {
        const row: Record<string, string | boolean> = {
          id: item.id,
          responsibility: item.name,
          isGroupRow: false,
        };

        filteredRolesForRaci.forEach(role => {
          const matrix = data.responsibilities.matrix as Record<string, Record<string, string>>;
          row[role.id] = matrix[item.id]?.[role.id] || '-';
        });

        rows.push(row);
      });
    });

    return rows;
  }, [filteredResponsibilities, filteredRolesForRaci, data.responsibilities.matrix, data.responsibilities.categories]);

  // Handle cell value changes for Permissions
  const onPermissionCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    const { data: rowData, colDef, newValue } = event;
    const itemId = rowData.id;
    const roleId = colDef.field;

    if (!roleId || roleId === 'permission') return;

    const value = newValue === '✓' || newValue === true;

    setData(prev => {
      const newMatrix = { ...prev.permissions.matrix } as Record<string, Record<string, boolean>>;
      if (!newMatrix[itemId]) {
        newMatrix[itemId] = {};
      }
      newMatrix[itemId] = { ...newMatrix[itemId], [roleId]: value };

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          matrix: newMatrix,
        },
        lastUpdated: new Date().toISOString(),
      };
    });
    setHasChanges(true);
  }, []);

  // Handle cell value changes for RACI
  const onRACICellValueChanged = useCallback((event: CellValueChangedEvent) => {
    const { data: rowData, colDef, newValue } = event;
    const itemId = rowData.id;
    const roleId = colDef.field;

    if (!roleId || roleId === 'responsibility') return;

    let value = (newValue as string || '-').toUpperCase();
    if (!['R', 'A', 'C', 'I', '-'].includes(value)) {
      value = '-';
    }

    setData(prev => {
      const newMatrix = { ...prev.responsibilities.matrix } as Record<string, Record<string, string>>;
      if (!newMatrix[itemId]) {
        newMatrix[itemId] = {};
      }
      newMatrix[itemId] = { ...newMatrix[itemId], [roleId]: value };

      return {
        ...prev,
        responsibilities: {
          ...prev.responsibilities,
          matrix: newMatrix,
        },
        lastUpdated: new Date().toISOString(),
      };
    });
    setHasChanges(true);
  }, []);

  // Handle header click for role popups via event delegation
  const handleGridClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    // Check if click is on a header cell
    const headerCell = target.closest('.ag-header-cell');
    if (!headerCell) return;

    // Get column id from the header cell
    const colId = headerCell.getAttribute('col-id');
    if (!colId || colId === 'permission' || colId === 'responsibility') return;

    // Find the role
    const role = data.roles.find(r => r.id === colId);
    if (!role?.description) return;

    showPopup(role.name, role.description, target);
  }, [data.roles, showPopup]);

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      await onSave(data);
      setHasChanges(false);
    } catch {
      // silent
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const roleGroups = data.roleGroups || [];

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: false,
    filter: false,
    resizable: true,
    suppressMovable: true,
  }), []);

  if (!mounted) {
    return (
      <div className="matrix-loading">
        <div className="matrix-loading-spinner" />
        <p>Loading matrix...</p>
      </div>
    );
  }

  return (
    <div className="matrix-container">
      {/* Header */}
      <header className="matrix-header">
        <div className="matrix-header-content">
          <h1>Permissions & Responsibilities</h1>
          <p>Role capabilities and RACI assignments for Austin Rifle Club</p>
        </div>

        {canEdit && (
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`matrix-save-btn ${hasChanges ? 'has-changes' : ''}`}
          >
            {saving ? (
              <>
                <span className="matrix-save-spinner" />
                Saving...
              </>
            ) : hasChanges ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Changes
              </>
            ) : (
              'No Changes'
            )}
          </button>
        )}
      </header>

      {/* Tab Navigation */}
      <nav className="matrix-tabs">
        <button
          className={`matrix-tab ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Permissions</span>
          <span className="tab-count">{data.permissions.items.length}</span>
        </button>
        <button
          className={`matrix-tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Members RACI</span>
          <span className="tab-count">{data.responsibilities.items.filter(i => raciTabCategories.members.includes(i.category)).length}</span>
        </button>
        <button
          className={`matrix-tab ${activeTab === 'range' ? 'active' : ''}`}
          onClick={() => setActiveTab('range')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <span>Ranges & Facilities RACI</span>
          <span className="tab-count">{data.responsibilities.items.filter(i => raciTabCategories.range.includes(i.category)).length}</span>
        </button>
        <button
          className={`matrix-tab ${activeTab === 'board' ? 'active' : ''}`}
          onClick={() => setActiveTab('board')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <span>Board RACI</span>
          <span className="tab-count">{data.responsibilities.items.filter(i => raciTabCategories.board.includes(i.category)).length}</span>
        </button>
      </nav>

      {/* Filters */}
      <div className="matrix-filters">
        <div className="matrix-filter">
          <label>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Roles
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {roleGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {activeTab === 'permissions' && (
          <div className="matrix-filter">
            <label>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Category
            </label>
            <select
              value={permissionCategoryFilter}
              onChange={(e) => setPermissionCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {data.permissions.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {(activeTab === 'members' || activeTab === 'range' || activeTab === 'board') && (
          <div className="matrix-filter">
            <label>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Category
            </label>
            <select
              value={responsibilityCategoryFilter}
              onChange={(e) => setResponsibilityCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {data.responsibilities.categories
                .filter(cat => activeRaciCategories?.includes(cat.id))
                .map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Permissions Table */}
      {activeTab === 'permissions' && (
        <section className="matrix-section">
          <div className="matrix-section-intro">
            <h2>Permissions Matrix</h2>
            <p>{data.permissions.description}</p>
          </div>

          <div className="matrix-legend permission-legend">
            <div className="legend-item granted">
              <span className="legend-badge">✓</span>
              <span>Granted</span>
            </div>
            <div className="legend-item denied">
              <span className="legend-badge">✗</span>
              <span>Not Granted</span>
            </div>
          </div>

          <div
            className="matrix-grid-wrapper"
            onClick={handleGridClick}
            data-hovered-column={hoveredColumn || ''}
            onMouseOver={(e) => {
              const cell = (e.target as HTMLElement).closest('.ag-cell');
              if (cell) {
                const colId = cell.getAttribute('col-id');
                if (colId && colId !== 'permission' && colId !== hoveredColumn) {
                  setHoveredColumn(colId);
                }
              }
            }}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <AgGridReact
              rowData={permissionRowData}
              columnDefs={permissionColumnDefs}
              defaultColDef={defaultColDef}
              onCellValueChanged={onPermissionCellValueChanged}
              domLayout="autoHeight"
              suppressHorizontalScroll={false}
              getRowId={(params) => params.data.id}
              getRowClass={(params) => params.data.isGroupRow ? 'matrix-group-row' : ''}
              rowHeight={44}
              headerHeight={130}
              tooltipShowDelay={300}
            />
          </div>
        </section>
      )}

      {/* RACI Tables */}
      {(activeTab === 'members' || activeTab === 'range' || activeTab === 'board') && (
        <section className="matrix-section">
          <div className="matrix-section-intro">
            <h2>
              {activeTab === 'members' && 'Members RACI Matrix'}
              {activeTab === 'range' && 'Ranges & Facilities RACI Matrix'}
              {activeTab === 'board' && 'Board RACI Matrix'}
            </h2>
            <p>
              {activeTab === 'members' && 'Responsibilities for membership management and events/education'}
              {activeTab === 'range' && 'Responsibilities for range safety and facilities/construction'}
              {activeTab === 'board' && 'Responsibilities for financial and governance matters'}
            </p>
          </div>

          <div className="matrix-legend raci-legend">
            {Object.entries(RACI_CONFIG).map(([key, config]) => (
              <div key={key} className="legend-item" data-value={key}>
                <span
                  className="legend-badge"
                  style={{
                    backgroundColor: config.bg,
                    color: config.color,
                    border: key === '-' ? '1px solid var(--color-border)' : 'none'
                  }}
                >
                  {key}
                </span>
                <span>{config.label}</span>
              </div>
            ))}
          </div>

          <div
            className="matrix-grid-wrapper"
            onClick={handleGridClick}
            data-hovered-column={hoveredColumn || ''}
            onMouseOver={(e) => {
              const cell = (e.target as HTMLElement).closest('.ag-cell');
              if (cell) {
                const colId = cell.getAttribute('col-id');
                if (colId && colId !== 'responsibility' && colId !== hoveredColumn) {
                  setHoveredColumn(colId);
                }
              }
            }}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <AgGridReact
              rowData={raciRowData}
              columnDefs={raciColumnDefs}
              defaultColDef={defaultColDef}
              onCellValueChanged={onRACICellValueChanged}
              domLayout="autoHeight"
              suppressHorizontalScroll={false}
              getRowId={(params) => params.data.id}
              getRowClass={(params) => params.data.isGroupRow ? 'matrix-group-row' : ''}
              rowHeight={44}
              headerHeight={130}
              tooltipShowDelay={300}
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="matrix-footer">
        <div className="matrix-meta">
          <span>Last updated: {new Date(data.lastUpdated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
          <span className="meta-divider">•</span>
          <span>by {data.lastUpdatedBy}</span>
        </div>
        {canEdit && (
          <p className="matrix-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Double-click any cell to edit
          </p>
        )}
      </footer>

      {/* Info Popup */}
      {popup && (
        <div
          className="matrix-popup"
          style={{
            left: popup.x,
            top: popup.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="matrix-popup-title">{popup.title}</div>
          <div className="matrix-popup-description">{popup.description}</div>
        </div>
      )}

      <style>{`
        .matrix-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 100%;
        }

        /* Loading State */
        .matrix-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
          color: var(--text-secondary, #6b7280);
        }

        .matrix-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--color-border, #e5e7eb);
          border-top-color: var(--color-primary, #3b82f6);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Header */
        .matrix-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .matrix-header-content h1 {
          margin: 0 0 0.25rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary, #111827);
          letter-spacing: -0.025em;
        }

        .matrix-header-content p {
          margin: 0;
          font-size: 0.9375rem;
          color: var(--text-secondary, #6b7280);
        }

        .matrix-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          background: var(--color-surface-elevated, #f3f4f6);
          color: var(--text-secondary, #6b7280);
        }

        .matrix-save-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .matrix-save-btn.has-changes {
          background: var(--color-primary, #3b82f6);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .matrix-save-btn.has-changes:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .matrix-save-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Tabs */
        .matrix-tabs {
          display: flex;
          gap: 0.25rem;
          background: var(--color-surface, #ffffff);
          padding: 0.375rem;
          border-radius: 12px;
          border: 1px solid var(--color-border, #e5e7eb);
        }

        .matrix-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary, #6b7280);
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .matrix-tab:hover {
          color: var(--text-primary, #111827);
          background: var(--color-surface-elevated, #f9fafb);
        }

        .matrix-tab.active {
          color: var(--color-primary, #3b82f6);
          background: var(--color-primary-light, #eff6ff);
          font-weight: 600;
        }

        .matrix-tab svg {
          flex-shrink: 0;
        }

        .tab-count {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          background: var(--color-surface-elevated, #f3f4f6);
          color: var(--text-secondary, #6b7280);
        }

        .matrix-tab.active .tab-count {
          background: var(--color-primary, #3b82f6);
          color: white;
        }

        /* Filters */
        .matrix-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .matrix-filter {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .matrix-filter label {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .matrix-filter select {
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary, #111827);
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          min-width: 160px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .matrix-filter select:hover {
          border-color: var(--color-border-hover, #d1d5db);
        }

        .matrix-filter select:focus {
          outline: none;
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Section */
        .matrix-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .matrix-section-intro {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .matrix-section-intro h2 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .matrix-section-intro p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-secondary, #6b7280);
        }

        /* Legend */
        .matrix-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          padding: 0.875rem 1rem;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 10px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-secondary, #6b7280);
        }

        .legend-badge {
          width: 1.625rem;
          height: 1.625rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .permission-legend .legend-item.granted .legend-badge {
          background: #16a34a;
          color: white;
        }

        .permission-legend .legend-item.denied .legend-badge {
          background: var(--color-surface-elevated, #f3f4f6);
          color: #9ca3af;
          border: 1px solid var(--color-border, #e5e7eb);
        }

        /* Grid */
        .matrix-grid-wrapper {
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 10px;
          overflow: hidden;
          background: var(--color-surface, #ffffff);
        }

        /* AG Grid Overrides */
        .ag-theme-alpine,
        .ag-theme-quartz,
        .ag-root-wrapper {
          --ag-background-color: var(--color-surface, #ffffff);
          --ag-header-background-color: var(--color-surface-elevated, #f9fafb);
          --ag-odd-row-background-color: var(--color-surface, #ffffff);
          --ag-row-hover-color: var(--color-surface-elevated, #f3f4f6);
          --ag-border-color: var(--color-border, #e5e7eb);
          --ag-font-family: inherit;
          --ag-font-size: 0.875rem;
          --ag-row-border-color: var(--color-border, #e5e7eb);
          --ag-header-cell-hover-background-color: var(--color-surface-elevated, #f3f4f6);
          --ag-foreground-color: var(--text-primary, #111827);
          --ag-secondary-foreground-color: var(--text-secondary, #6b7280);
          --ag-data-color: var(--text-primary, #111827);
          --ag-header-foreground-color: var(--text-secondary, #6b7280);
          border: none !important;
        }

        .ag-root-wrapper,
        .ag-root,
        .ag-body-viewport,
        .ag-center-cols-viewport,
        .ag-center-cols-container {
          background-color: var(--color-surface, #ffffff) !important;
        }

        .ag-row {
          background-color: var(--color-surface, #ffffff) !important;
        }

        .ag-row-odd {
          background-color: var(--color-surface, #ffffff) !important;
        }

        .ag-header {
          background-color: var(--color-surface-elevated, #f9fafb) !important;
          border-bottom: 1px solid var(--color-border, #e5e7eb) !important;
        }

        .ag-header-cell {
          font-family: "Inter", ui-sans-serif, system-ui, sans-serif !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
          color: var(--text-secondary, #6b7280) !important;
          background-color: var(--color-surface-elevated, #f9fafb) !important;
        }

        .matrix-header-cell {
          text-align: center !important;
        }

        .ag-header-cell-text {
          white-space: normal !important;
          line-height: 1.3 !important;
        }

        /* Rotated header styles for RACI role columns */
        .matrix-rotated-header {
          overflow: visible !important;
          border: none !important;
        }

        .matrix-rotated-header .ag-header-cell-resize {
          display: none !important;
        }

        /* Column highlight on cell hover - border lane leading to role */
        .column-highlighted {
          box-shadow: inset 3px 0 0 0 #1e40af, inset -3px 0 0 0 #1e40af !important;
        }

        .matrix-rotated-header .ag-header-cell-comp-wrapper {
          overflow: visible !important;
        }

        .matrix-rotated-header .ag-header-cell-label {
          overflow: visible !important;
          height: 100% !important;
          display: flex !important;
          align-items: flex-end !important;
          justify-content: flex-start !important;
          padding-bottom: 6px !important;
        }

        .matrix-rotated-header .ag-header-cell-text {
          transform: rotate(-45deg) !important;
          transform-origin: left bottom !important;
          white-space: nowrap !important;
          overflow: visible !important;
          font-size: 0.6875rem !important;
          line-height: 1 !important;
          position: absolute !important;
          bottom: 6px !important;
          left: 50% !important;
        }

        .matrix-label-cell {
          font-family: "Inter", ui-sans-serif, system-ui, sans-serif !important;
          font-weight: 500 !important;
          color: var(--text-primary, #111827) !important;
          background: var(--color-surface-elevated, #f9fafb) !important;
          border-right: 1px solid var(--color-border, #e5e7eb) !important;
        }

        /* Category Group Rows */
        .matrix-group-row {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
        }

        .matrix-group-row .ag-cell {
          background: transparent !important;
          color: white !important;
          font-weight: 700 !important;
          font-size: 0.8125rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }

        .matrix-group-row .matrix-label-cell {
          background: transparent !important;
          color: white !important;
          border-right-color: rgba(255, 255, 255, 0.2) !important;
        }

        .matrix-group-row:hover,
        .matrix-group-row:hover .ag-cell,
        .matrix-group-row:hover .matrix-label-cell,
        .matrix-group-row.ag-row-hover,
        .matrix-group-row.ag-row-hover .ag-cell {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          color: white !important;
        }

        .ag-cell {
          display: flex !important;
          align-items: center !important;
        }

        .ag-pinned-left-header,
        .ag-pinned-left-cols-container {
          border-right: 2px solid var(--color-border, #d1d5db) !important;
          background-color: var(--color-surface-elevated, #f9fafb) !important;
        }

        /* Hide the "No Rows" overlay since we have data */
        .ag-overlay-no-rows-wrapper {
          display: none !important;
        }

        /* Tooltip Styles */
        .ag-tooltip {
          background-color: #1f2937 !important;
          color: #f9fafb !important;
          padding: 0.625rem 0.875rem !important;
          border-radius: 8px !important;
          font-size: 0.8125rem !important;
          line-height: 1.4 !important;
          max-width: 280px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid #374151 !important;
          white-space: normal !important;
          word-wrap: break-word !important;
        }

        .ag-tooltip::before {
          display: none !important;
        }

        /* Clickable Cells */
        .matrix-clickable-cell {
          cursor: pointer !important;
        }

        .matrix-clickable-cell:hover {
          text-decoration: underline !important;
          text-decoration-style: dotted !important;
          text-underline-offset: 2px !important;
        }

        /* Clickable Headers */
        .matrix-clickable-header {
          cursor: pointer !important;
        }

        .matrix-clickable-header:hover .ag-header-cell-text {
          text-decoration: underline !important;
          text-decoration-style: dotted !important;
          text-underline-offset: 2px !important;
        }

        /* Info Popup */
        .matrix-popup {
          position: fixed;
          transform: translateX(-50%);
          z-index: 1000;
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          color: #f9fafb;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 10px 20px -5px rgba(0, 0, 0, 0.3);
          border: 1px solid #374151;
          max-width: 320px;
          min-width: 200px;
          animation: popupFadeIn 0.15s ease-out;
        }

        @keyframes popupFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .matrix-popup-title {
          font-weight: 600;
          font-size: 0.9375rem;
          margin-bottom: 0.5rem;
          color: #60a5fa;
        }

        .matrix-popup-description {
          font-size: 0.8125rem;
          line-height: 1.5;
          color: #d1d5db;
        }

        /* Footer */
        .matrix-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-top: 0.5rem;
        }

        .matrix-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-muted, #9ca3af);
        }

        .meta-divider {
          opacity: 0.5;
        }

        .matrix-hint {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          margin: 0;
          font-size: 0.8125rem;
          color: var(--text-secondary, #6b7280);
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .matrix-container {
            --color-surface: #1f2937;
            --color-surface-elevated: #374151;
            --color-border: #4b5563;
            --color-border-hover: #6b7280;
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --text-muted: #9ca3af;
            --color-primary: #60a5fa;
            --color-primary-light: rgba(96, 165, 250, 0.15);
          }

          .matrix-filter select {
            background-color: #1f2937;
            color: #f9fafb;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          }

          .matrix-grid-wrapper {
            background: #1f2937;
          }

          .ag-root-wrapper,
          .ag-root,
          .ag-body-viewport,
          .ag-center-cols-viewport,
          .ag-center-cols-container,
          .ag-row,
          .ag-row-odd {
            background-color: #1f2937 !important;
          }

          .ag-header,
          .ag-header-cell,
          .ag-pinned-left-header,
          .ag-pinned-left-cols-container,
          .matrix-label-cell {
            background-color: #374151 !important;
          }

          .ag-header-cell,
          .ag-header-cell-text {
            color: #d1d5db !important;
          }

          .matrix-label-cell {
            color: #f9fafb !important;
          }
        }

        [data-theme="dark"] .matrix-container {
          --color-surface: #1f2937;
          --color-surface-elevated: #374151;
          --color-border: #4b5563;
          --color-border-hover: #6b7280;
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --text-muted: #9ca3af;
          --color-primary: #60a5fa;
          --color-primary-light: rgba(96, 165, 250, 0.15);
        }

        [data-theme="dark"] .matrix-filter select {
          background-color: #1f2937;
          color: #f9fafb;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        }

        [data-theme="dark"] .matrix-grid-wrapper {
          background: #1f2937;
        }

        [data-theme="dark"] .ag-root-wrapper,
        [data-theme="dark"] .ag-root,
        [data-theme="dark"] .ag-body-viewport,
        [data-theme="dark"] .ag-center-cols-viewport,
        [data-theme="dark"] .ag-center-cols-container,
        [data-theme="dark"] .ag-row,
        [data-theme="dark"] .ag-row-odd {
          background-color: #1f2937 !important;
        }

        [data-theme="dark"] .ag-header,
        [data-theme="dark"] .ag-header-cell,
        [data-theme="dark"] .ag-pinned-left-header,
        [data-theme="dark"] .ag-pinned-left-cols-container,
        [data-theme="dark"] .matrix-label-cell {
          background-color: #374151 !important;
        }

        [data-theme="dark"] .ag-header-cell,
        [data-theme="dark"] .ag-header-cell-text {
          color: #d1d5db !important;
        }

        [data-theme="dark"] .matrix-label-cell {
          color: #f9fafb !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .matrix-header {
            flex-direction: column;
            align-items: stretch;
          }

          .matrix-save-btn {
            width: 100%;
            justify-content: center;
          }

          .matrix-tabs {
            flex-direction: column;
          }

          .matrix-tab {
            justify-content: flex-start;
          }

          .matrix-legend {
            flex-direction: column;
            gap: 0.75rem;
          }

          .matrix-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
