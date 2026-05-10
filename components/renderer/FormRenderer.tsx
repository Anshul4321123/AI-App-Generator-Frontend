'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Page } from '../../types';
import { useRecords } from '../../hooks/useRecords';
import { useLanguage } from '../../context/LanguageContext';
import MultiUserSelect from '../MultiUserSelect';
import ProjectSelect from '../ProjectSelect';

interface FormRendererProps {
  page: Page;
  onSuccess?: () => void;
  initialData?: Record<string, any>;
  isEdit?: boolean;
  onUpdate?: (id: string, data: any) => Promise<void>;
  recordId?: string;
}

// Helper to get label text
function getLabel(
  label: string | Record<string, string> | undefined, 
  fieldName: string, 
  language: string,
  t: (key: string, fallback?: string) => string
): string {
  if (!label) {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }
  if (typeof label === 'string') return label;
  return label[language] || Object.values(label)[0] || fieldName;
}

// Parse stored assigned_users from JSON string
function parseAssignedUsers(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function FormRenderer({ page, onSuccess, initialData, isEdit, onUpdate, recordId }: FormRendererProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [multiSelectValues, setMultiSelectValues] = useState<Record<string, string[]>>({});
  const { createRecord, updateRecord } = useRecords(page.entity);
  const { language, t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Initialize form with existing data for edit mode
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        setValue(key, initialData[key]);
      });
      
      Object.keys(initialData).forEach(key => {
        if (initialData[key] && (key === 'assigned_users' || key.includes('users'))) {
          const parsed = parseAssignedUsers(initialData[key]);
          setMultiSelectValues(prev => ({ ...prev, [key]: parsed }));
        }
      });
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const processedData = { ...data };
      
      // Handle multi-select values
      Object.keys(multiSelectValues).forEach(key => {
        processedData[key] = JSON.stringify(multiSelectValues[key]);
      });
      
      // Format date properly - ENFORCE DATE TYPE
      if (processedData.due_date && processedData.due_date !== '') {
        const dateObj = new Date(processedData.due_date);
        if (!isNaN(dateObj.getTime())) {
          processedData.due_date = dateObj.toISOString().split('T')[0];
        } else {
          delete processedData.due_date;
        }
      }
      
      // ENFORCE NUMBER TYPE for story_points
      if (processedData.story_points) {
        processedData.story_points = Number(processedData.story_points);
        if (isNaN(processedData.story_points)) {
          delete processedData.story_points;
        }
      }
      
      if (isEdit && onUpdate && recordId) {
        await onUpdate(recordId, processedData);
      } else {
        await createRecord(processedData);
      }
      
      reset();
      setMultiSelectValues({});
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMultiSelectChange = (fieldName: string, values: string[]) => {
    setMultiSelectValues(prev => ({ ...prev, [fieldName]: values }));
    setValue(fieldName, JSON.stringify(values));
  };

  const fields = page.fields || [];

  if (fields.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">No fields configured for this form.</p>
      </div>
    );
  }

  // Helper to determine input type based on field name
  const getForcedInputType = (fieldName: string): string => {
    // FORCE date picker for due_date
    if (fieldName === 'due_date') return 'date';
    // FORCE number for story_points
    if (fieldName === 'story_points') return 'number';
    // FORCE email for email fields
    if (fieldName === 'email') return 'email';
    // Default to text
    return 'text';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? `Edit ${page.title.replace('Create', '').trim()}` : page.title}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {fields.map((field) => {
          const label = getLabel(field.label, field.name, language, t);
          const isRequired = field.required || false;
          const placeholder = field.placeholder || `Enter ${label.toLowerCase()}`;
          
          const baseInputClass = `
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
            ${errors[field.name] 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
            }
          `;

          // ============ FORCE Multi-Select for assigned_users ============
          if (field.name === 'assigned_users') {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <MultiUserSelect
                  value={multiSelectValues[field.name] || parseAssignedUsers(initialData?.[field.name])}
                  onChange={(values) => handleMultiSelectChange(field.name, values)}
                  placeholder={placeholder || 'Select team members'}
                />
              </div>
            );
          }

// ============ FORCE Project Select ============
if (field.name === 'project_id') {
  // Get the current value from form state or initialData
  const currentProjectValue = initialData?.[field.name] || '';
  
  return (
    <div key={field.name}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <ProjectSelect
        value={currentProjectValue}
        onChange={(projectId) => {
          setValue(field.name, projectId);
          // Also store in initialData for persistence
          if (initialData) {
            initialData[field.name] = projectId;
          }
        }}
        placeholder={placeholder || 'Select a project'}
        required={isRequired}
      />
    </div>
  );
}

          // ============ FORCE Textarea ============
          if (field.type === 'textarea') {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  {...register(field.name, { required: isRequired })}
                  placeholder={placeholder}
                  rows={4}
                  className={baseInputClass}
                  defaultValue={initialData?.[field.name] || ''}
                />
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[field.name]?.message as string || `${label} is required`}
                  </p>
                )}
              </div>
            );
          }

          // ============ FORCE Select field ============
          if (field.type === 'select') {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  {...register(field.name, { required: isRequired })}
                  className={baseInputClass}
                  defaultValue={initialData?.[field.name] || ''}
                >
                  <option value="">Select an option</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[field.name]?.message as string || `${label} is required`}
                  </p>
                )}
              </div>
            );
          }

          // ============ FORCED INPUT TYPES based on field name ============
          const forcedType = getForcedInputType(field.name);
          
          // FORCED Date input
          if (forcedType === 'date') {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="date"
                  {...register(field.name, { required: isRequired })}
                  className={baseInputClass}
                  defaultValue={initialData?.[field.name]?.split('T')[0] || ''}
                />
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[field.name]?.message as string || `${label} is required`}
                  </p>
                )}
              </div>
            );
          }

          // FORCED Number input
          if (forcedType === 'number') {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="number"
                  step="1"
                  {...register(field.name, { required: isRequired, valueAsNumber: true })}
                  placeholder={placeholder}
                  className={baseInputClass}
                  defaultValue={initialData?.[field.name] || ''}
                />
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[field.name]?.message as string || `${label} is required`}
                  </p>
                )}
              </div>
            );
          }

          // FORCED Email input
          if (forcedType === 'email') {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="email"
                  {...register(field.name, { 
                    required: isRequired,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    }
                  })}
                  placeholder={placeholder}
                  className={baseInputClass}
                  defaultValue={initialData?.[field.name] || ''}
                />
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[field.name]?.message as string || `${label} is required`}
                  </p>
                )}
              </div>
            );
          }

          // ============ Default Text input ============
          return (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                {...register(field.name, { required: isRequired })}
                placeholder={placeholder}
                className={baseInputClass}
                defaultValue={initialData?.[field.name] || ''}
              />
              {errors[field.name] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors[field.name]?.message as string || `${label} is required`}
                </p>
              )}
            </div>
          );
        })}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Submit'}
        </button>
      </form>
    </div>
  );
}