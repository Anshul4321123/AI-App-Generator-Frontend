'use client';

import React, { useState, useEffect } from 'react';
import { Page, DataRecord } from '../../types';
import { useRecords } from '../../hooks/useRecords';
import FormRenderer from './FormRenderer';
import api from '../../services/api';

interface TableRendererProps {
  page: Page;
  onEdit?: (record: DataRecord) => void;
  onDelete?: (id: string) => void;
  refreshTrigger?: number;
}

// Cache for project names and user emails
let projectsCache: Record<string, string> = {};
let usersCache: Record<string, string> = {};

// Helper to get nested value from object
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Get column keys from first record's data
function inferColumns(records: DataRecord[]): string[] {
  if (records.length === 0) return [];
  const firstRecordData = records[0].data;
  if (!firstRecordData || typeof firstRecordData !== 'object') return [];
  return Object.keys(firstRecordData);
}

// Format cell value for display
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 50);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

// Build form fields from record data for editing
function buildEditFields(record: DataRecord): any[] {
  return Object.keys(record.data).map(key => ({
    name: key,
    type: key === 'assigned_users' ? 'multi-select' : (typeof record.data[key] === 'number' ? 'number' : 'text'),
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    required: false
  }));
}

// Fetch projects and users for display
async function fetchProjectsAndUsers() {
  try {
    const token = localStorage.getItem('token');
    
    // Fetch projects
    const projectsRes = await api.get('/api/projects');
    projectsRes.data.data?.forEach((p: any) => {
      projectsCache[p.id] = p.data?.name || p.name || 'Unknown';
    });
    
    // Fetch users
    const usersRes = await api.get('/auth/users/list');
    usersRes.data.data?.forEach((u: any) => {
      usersCache[u.id] = u.email;
    });
  } catch (err) {
    console.error('Failed to fetch display data:', err);
  }
}

// Get project name from ID
function getProjectName(projectId: string): string {
  return projectsCache[projectId] || projectId?.slice(0, 8) + '...' || 'N/A';
}

// Get user email from ID (for assigned_users)
function getUserEmail(userId: string): string {
  return usersCache[userId] || userId?.slice(0, 8) + '...' || 'N/A';
}

export default function TableRenderer({ page, onEdit, onDelete, refreshTrigger }: TableRendererProps) {
  const { records, loading, error, deleteRecord, updateRecord, refetch } = useRecords(page.entity);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [displayDataLoaded, setDisplayDataLoaded] = useState(false);

  // Fetch projects and users on mount
  useEffect(() => {
    fetchProjectsAndUsers().then(() => setDisplayDataLoaded(true));
  }, []);

  // Refetch when records change (to get new project names)
  useEffect(() => {
    if (records.length > 0) {
      fetchProjectsAndUsers();
    }
  }, [records]);

  // Refresh when external trigger changes
  useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const columns = inferColumns(records);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteRecord(id);
      if (onDelete) onDelete(id);
      refetch();
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err.message || 'Failed to delete record');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleEdit = (record: DataRecord) => {
    // console.log('✏️ Opening edit modal for:', record.id);
    setEditingRecord(record);
    setShowEditModal(true);
    if (onEdit) onEdit(record);
  };

  const handleUpdate = async (id: string, data: any) => {
    // console.log('🔄 Updating record:', id, data);
    try {
      await updateRecord(id, data);
      setShowEditModal(false);
      setEditingRecord(null);
      refetch();
      alert('Task updated successfully!');
    } catch (err: any) {
      console.error('Update failed:', err);
      alert(err.message || 'Failed to update record');
    }
  };

  // Format cell value with special handling for project_id and assigned_users
  const getFormattedCellValue = (record: DataRecord, col: string): string => {
    const value = getNestedValue(record.data, col);
    
    // Handle project_id - show project name
    if (col === 'project_id' && value) {
      return getProjectName(value);
    }
    
    // Handle assigned_users - show emails
    if (col === 'assigned_users' && value) {
      let userIds: string[] = [];
      if (typeof value === 'string') {
        try { userIds = JSON.parse(value); } catch { userIds = [value]; }
      } else if (Array.isArray(value)) {
        userIds = value;
      }
      if (userIds.length === 0) return 'N/A';
      const emails = userIds.map(id => getUserEmail(id));
      return emails.join(', ');
    }
    
    // Handle arrays in general
    if (Array.isArray(value)) {
      return value.map(v => formatCellValue(v)).join(', ');
    }
    
    return formatCellValue(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{page.title}</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{page.title}</h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{page.title}</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">No records found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first {page.entity} record using the form above.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-gray-800">{page.title}</h2>
          <div className="text-sm text-gray-500">{records.length} record{records.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Desktop view - table layout */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFormattedCellValue(record, col)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                      {showDeleteConfirm === record.id ? (
                        <>
                          <button onClick={() => handleDelete(record.id)} disabled={deletingId === record.id} className="text-red-600 hover:text-red-900">
                            {deletingId === record.id ? '...' : 'Confirm'}
                          </button>
                          <button onClick={() => setShowDeleteConfirm(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setShowDeleteConfirm(record.id)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button onClick={() => refetch()} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Edit {page.entity}</h3>
              <button onClick={() => { setShowEditModal(false); setEditingRecord(null); }} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="p-4">
              <FormRenderer
                page={{
                  type: 'form',
                  entity: page.entity,
                  title: `Edit ${page.entity}`,
                  fields: buildEditFields(editingRecord)
                }}
                initialData={editingRecord.data}
                isEdit={true}
                recordId={editingRecord.id}
                onUpdate={handleUpdate}
                onSuccess={() => { setShowEditModal(false); setEditingRecord(null); refetch(); }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}