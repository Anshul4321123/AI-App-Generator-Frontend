'use client';

import React, { useState } from 'react';
import { AppConfig, Page, DataRecord } from '../../types';
import { getComponent } from './componentRegistry';
import { useLanguage } from '../../context/LanguageContext';

interface PageRendererProps {
  config: AppConfig;
  warnings?: string[];
  onRecordCreated?: () => void;
  onRecordUpdated?: (record: DataRecord) => void;
  onRecordDeleted?: () => void;
}

export default function PageRenderer({ 
  config, 
  warnings = [],
  onRecordCreated,
  onRecordUpdated,
  onRecordDeleted 
}: PageRendererProps) {
  const { t } = useLanguage();
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);

  // Show warnings if any (for debugging)
  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('Config warnings:', warnings);
  }

  if (!config) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600">{t('message.error')}</p>
      </div>
    );
  }

  if (!config.pages || config.pages.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('message.noPages')}</h3>
        <p className="text-gray-600">
          This app doesn't have any pages configured yet.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Add pages with <code className="bg-yellow-100 px-1 rounded">type: "form"</code> or <code className="bg-yellow-100 px-1 rounded">type: "table"</code> to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Display warnings in development */}
      {warnings.length > 0 && process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <p className="text-yellow-800 font-medium mb-2">⚠️ Config Warnings:</p>
          <ul className="list-disc list-inside text-xs text-yellow-700">
            {warnings.slice(0, 5).map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {config.pages.map((page: Page, index: number) => {
        const Component = getComponent(page.type);
        
        return (
          <div key={`${page.type}-${page.title}-${index}`}>
            <Component 
              page={page}
              onSuccess={onRecordCreated}
              onEdit={page.type === 'table' ? setEditingRecord : undefined}
              onDelete={onRecordDeleted}
            />
          </div>
        );
      })}
    </div>
  );
}