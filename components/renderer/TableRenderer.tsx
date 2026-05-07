'use client';

import React, { useState } from 'react';
import { Page, Record } from '../../types';
import { useRecords } from '../../hooks/useRecords';

interface TableRendererProps {
  page: Page;
  onEdit?: (record: Record) => void;
  onDelete?: (id: string) => void;
}

// Helper to get nested value from object (e.g., "user.name" -> value)
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Get column keys from first record's data
function inferColumns(records: Record[]): string[] {
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

export default function TableRenderer({ page, onEdit, onDelete }: TableRendererProps) {
  const { records, loading, error, deleteRecord, refetch } = useRecords(page.entity);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Infer columns from data
  const columns = inferColumns(records);

  // Handle delete with confirmation
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteRecord(id);
      if (onDelete) onDelete(id);
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err.message || 'Failed to delete record');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{page.title}</h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{page.title}</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No records found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first {page.entity} record using the form above.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-gray-800">{page.title}</h2>
        <div className="text-sm text-gray-500">
          {records.length} record{records.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Mobile view - card layout */}
      <div className="block md:hidden divide-y divide-gray-200">
        {records.map((record) => (
          <div key={record.id} className="p-4 hover:bg-gray-50">
            {columns.slice(0, 3).map((col) => (
              <div key={col} className="mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase block">
                  {col}
                </span>
                <span className="text-sm text-gray-900">
                  {formatCellValue(getNestedValue(record.data, col))}
                </span>
              </div>
            ))}
            {columns.length > 3 && (
              <div className="text-xs text-gray-400 mt-1">
                +{columns.length - 3} more fields
              </div>
            )}
            {(onEdit || onDelete) && (
              <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                {onEdit && (
                  <button
                    onClick={() => onEdit(record)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <>
                    {showDeleteConfirm === record.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          {deletingId === record.id ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(record.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop view - table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCellValue(getNestedValue(record.data, col))}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <>
                          {showDeleteConfirm === record.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(record.id)}
                                disabled={deletingId === record.id}
                                className="text-red-600 hover:text-red-900"
                              >
                                {deletingId === record.id ? '...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setShowDeleteConfirm(record.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refresh button */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <button
          onClick={() => refetch()}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
}