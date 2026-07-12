/**
 * useDepartments — single source of truth for department data.
 *
 * Used by:
 *   - Organization Setup / Departments tab
 *   - Organization Setup / Employee Directory tab (department column)
 *   - Asset Registration (department select)
 *
 * Backed by React state (local mock for now). In production, swap
 * the seed data for an API call and expose mutate helpers that call the API.
 */

import { useState, useCallback } from 'react';

// ─── Seed data (matches prompt placeholder rows) ─────────────────────────────
const INITIAL_DEPARTMENTS = [
  {
    id: 'dept-1',
    name: 'Engineering',
    head: { id: 'emp-1', name: 'Aditi Rao', initials: 'AR' },
    parentId: null,
    status: 'active',
  },
  {
    id: 'dept-2',
    name: 'Facilities',
    head: { id: 'emp-2', name: 'Rohan Mehta', initials: 'RM' },
    parentId: null,
    status: 'active',
  },
  {
    id: 'dept-3',
    name: 'Field Ops',
    head: null,
    parentId: null,
    status: 'active',
  },
  {
    id: 'dept-4',
    name: 'Field Ops (East)',
    head: { id: 'emp-3', name: 'Sana Iqbal', initials: 'SI' },
    parentId: 'dept-3',
    status: 'inactive',
  },
];

let _departments = [...INITIAL_DEPARTMENTS];
const _listeners = new Set();

function notify() {
  _listeners.forEach((fn) => fn([..._departments]));
}

/**
 * Subscribe to department changes from outside React (for cross-component sync).
 * Returns an unsubscribe function.
 */
export function subscribeToDepartments(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

/**
 * useDepartments() hook
 * Returns { departments, addDepartment, updateDepartment, getDepartmentById }
 */
export function useDepartments() {
  const [departments, setDepartments] = useState([..._departments]);

  // Keep in sync when other callers mutate the shared list
  const sync = useCallback((next) => setDepartments(next), []);
  // Register listener on first call (idempotent because Set deduplicates)
  _listeners.add(sync);

  const addDepartment = useCallback((dept) => {
    const next = {
      id: `dept-${Date.now()}`,
      ...dept,
    };
    _departments = [..._departments, next];
    notify();
  }, []);

  const updateDepartment = useCallback((id, patch) => {
    _departments = _departments.map((d) => (d.id === id ? { ...d, ...patch } : d));
    notify();
  }, []);

  const getDepartmentById = useCallback(
    (id) => _departments.find((d) => d.id === id) ?? null,
    []
  );

  const getDepartmentName = useCallback(
    (id) => _departments.find((d) => d.id === id)?.name ?? '—',
    []
  );

  return {
    departments,
    addDepartment,
    updateDepartment,
    getDepartmentById,
    getDepartmentName,
  };
}
