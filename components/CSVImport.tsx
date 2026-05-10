'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNotificationStore } from '../store/notificationStore';
import api from '../services/api';

interface CSVImportProps {
  entity: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CSVImport({ entity, onSuccess, onError }: CSVImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<{ imported: number; failed: number; total: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { addNotification } = useNotificationStore();

  // Get API URL from environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const parseCSVHeaders = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        if (lines.length === 0) {
          reject(new Error('Empty file'));
          return;
        }
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        resolve(headers);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      if (onError) onError('Please upload a CSV file');
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    
    try {
      const headers = await parseCSVHeaders(file);
      setCsvHeaders(headers);
      
      // Auto-map columns with similar names
      const autoMapping: Record<string, string> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader === 'name' || lowerHeader === 'fullname') autoMapping[header] = 'name';
        else if (lowerHeader === 'email') autoMapping[header] = 'email';
        else if (lowerHeader === 'phone' || lowerHeader === 'phonenumber') autoMapping[header] = 'phone';
        else if (lowerHeader === 'city') autoMapping[header] = 'city';
        else if (lowerHeader === 'status') autoMapping[header] = 'status';
        else if (lowerHeader === 'price') autoMapping[header] = 'price';
        else if (lowerHeader === 'description') autoMapping[header] = 'description';
        else if (lowerHeader === 'title') autoMapping[header] = 'title';
        else if (lowerHeader === 'priority') autoMapping[header] = 'priority';
        else autoMapping[header] = header;
      });
      setColumnMapping(autoMapping);
      setShowMapping(true);
    } catch (err) {
      if (onError) onError('Failed to parse CSV file');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImport = async () => {
    const file = selectedFile;
    
    if (!file) {
      console.error('No file found!');
      if (onError) onError('No file selected');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('columnMapping', JSON.stringify(columnMapping));

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const token = localStorage.getItem('token');
      
      // ✅ Use dynamic API URL from environment variable
      const response = await fetch(`${API_BASE_URL}/api/import/${entity}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        const { imported, failed, total } = data.data;
        setResult({ imported, failed, total });
        
        addNotification({
          id: Date.now().toString(),
          message: `CSV Import: ${imported} records imported to ${entity}${failed > 0 ? ` (${failed} failed)` : ''}`,
          type: failed > 0 ? 'warning' : 'success',
          read: false,
          created_at: new Date().toISOString(),
        });
        
        if (onSuccess) onSuccess();
        
        setTimeout(() => {
          setResult(null);
          setShowMapping(false);
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }, 3000);
      } else {
        throw new Error(data.error || 'Import failed');
      }
    } catch (err: any) {
      console.error('❌ Import error:', err);
      clearInterval(progressInterval);
      const errorMsg = err.message || 'Import failed';
      if (onError) onError(errorMsg);
      addNotification({
        id: Date.now().toString(),
        message: `CSV Import failed: ${errorMsg}`,
        type: 'error',
        read: false,
        created_at: new Date().toISOString(),
      });
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const updateMapping = (csvColumn: string, dbField: string) => {
    setColumnMapping(prev => ({ ...prev, [csvColumn]: dbField }));
  };

  const handleCancel = () => {
    setShowMapping(false);
    setResult(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {t('action.import')} CSV
        </h3>
      </div>
      
      <div className="p-6">
        {!showMapping ? (
          <div className="text-center">
            <label className="block">
              <input
                aria-label="input for csv"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </label>
            <p className="text-xs text-gray-400 mt-2">
              Supported format: .csv files with headers
            </p>
            {isUploading && (
              <div className="mt-3 text-sm text-blue-600">Parsing file...</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">📋 Column Mapping</p>
              <p className="text-xs text-blue-600 mb-3">
                Map CSV columns to database fields. Unmapped columns will be stored as-is.
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {csvHeaders.map((header) => (
                  <div key={header} className="flex items-center gap-3 text-sm">
                    <span className="w-32 font-mono text-xs bg-blue-100 px-2 py-1 rounded">
                      {header}
                    </span>
                    <span className="text-gray-400">→</span>
                    <input
                      type="text"
                      value={columnMapping[header] || ''}
                      onChange={(e) => updateMapping(header, e.target.value)}
                      placeholder="field name"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={`p-3 rounded-lg ${result.failed > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <p className={`text-sm font-medium ${result.failed > 0 ? 'text-yellow-800' : 'text-green-800'}`}>
                  ✓ Import complete!
                </p>
                <p className="text-xs mt-1">
                  {result.imported} imported, {result.failed} failed, {result.total} total
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={isUploading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isUploading ? t('message.loading') : t('action.import')}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}