'use client';

import React, { useState } from 'react';
import { AppConfig, Page, DataRecord } from '../../types';
import { getComponent } from './componentRegistry';

interface PageRendererProps {
  config: AppConfig;
  onRecordCreated?: () => void;
  onRecordUpdated?: (record: DataRecord) => void;
  onRecordDeleted?: (id: string) => void;
}

export default function PageRenderer({ 
  config, 
  onRecordCreated,
  onRecordUpdated,
  onRecordDeleted 
}: PageRendererProps) {
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);

  // Debug: Log the config to see what's being received
  console.log('📋 PageRenderer received config:', config);
  console.log('📄 Pages array:', config?.pages);
  console.log('📄 Pages length:', config?.pages?.length);

  // Check if config has pages
  if (!config) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600">No configuration found</p>
      </div>
    );
  }

  if (!config.pages || config.pages.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pages Configured</h3>
        <p className="text-gray-600">
          This app doesn't have any pages configured yet.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Add pages with <code className="bg-yellow-100 px-1 rounded">type: "form"</code> or <code className="bg-yellow-100 px-1 rounded">type: "table"</code> to get started.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Debug: config.pages = {JSON.stringify(config.pages)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {config.pages.map((page: Page, index: number) => {
        const Component = getComponent(page.type);
        
        console.log(`🎨 Rendering page ${index}:`, page.type, page.title);
        
        return (
          <div key={`${page.type}-${page.title}-${index}`}>
            <Component 
              page={page}
              onSuccess={onRecordCreated}
              onEdit={page.type === 'table' ? setEditingRecord : undefined}
              onDelete={onRecordDeleted}
            />
            
            {/* Edit modal can be added here if needed */}
            {editingRecord && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Edit Record</h3>
                    <button 
                      onClick={() => setEditingRecord(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Edit functionality coming soon. ID: {editingRecord.id}
                    </p>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(editingRecord.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}