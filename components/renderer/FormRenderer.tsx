'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Page, Field } from '../../types';
import { useRecords } from '../../hooks/useRecords';

interface FormRendererProps {
  page: Page;
  onSuccess?: () => void;
}

// Helper to get label text (supports i18n objects or strings)
function getLabel(label: string | Record<string, string> | undefined, fieldName: string): string {
  if (!label) return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  if (typeof label === 'string') return label;
  // Default to English or first available language
  return label.en || label.hi || Object.values(label)[0] || fieldName;
}

// Render field based on type with fallback to text input
function renderField(field: Field, register: any, errors: any) {
  const label = getLabel(field.label, field.name);
  const isRequired = field.required || false;
  const placeholder = field.placeholder || `Enter ${label.toLowerCase()}`;

  const baseInputClass = `
    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
    ${errors[field.name]
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:ring-blue-500'
    }
  `;

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          {...register(field.name, { required: isRequired })}
          placeholder={placeholder}
          rows={4}
          className={baseInputClass}
        />
      );

    case 'select':
      return (
        <select {...register(field.name, { required: isRequired })} className={baseInputClass}>
          <option value="">Select {label}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'number':
      return (
        <input
          type="number"
          {...register(field.name, { required: isRequired, valueAsNumber: true })}
          placeholder={placeholder}
          className={baseInputClass}
        />
      );

    case 'email':
      return (
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
        />
      );

    case 'text':
    default:
      // Default to text input for unknown types
      return (
        <input
          type="text"
          {...register(field.name, { required: isRequired })}
          placeholder={placeholder}
          className={baseInputClass}
        />
      );
  }
}

export default function FormRenderer({ page, onSuccess }: FormRendererProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createRecord } = useRecords(page.entity);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createRecord(data);
      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle missing fields gracefully
  const fields = page.fields || [];

  if (fields.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">No fields configured for this form.</p>
        <p className="text-xs text-gray-400 mt-2">Add fields to your app configuration.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">{page.title}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getLabel(field.label, field.name)}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field, register, errors)}
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">
                {errors[field.name]?.message as string || `${getLabel(field.label, field.name)} is required`}
              </p>
            )}
          </div>
        ))}

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
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}