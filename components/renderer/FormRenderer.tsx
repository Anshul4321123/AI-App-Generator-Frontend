'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Page, Field } from '../../types';
import { useRecords } from '../../hooks/useRecords';
import { useLanguage } from '../../context/LanguageContext';

interface FormRendererProps {
  page: Page;
  onSuccess?: () => void;
}

// Helper to get label text with localization support
function getLabel(
  label: string | Record<string, string> | undefined, 
  fieldName: string, 
  language: string,
  t: (key: string, fallback?: string) => string
): string {
  if (!label) {
    // Try to get from translations, fallback to field name
    const translated = t(`label.${fieldName}`, fieldName);
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }
  if (typeof label === 'string') return label;
  // Return language-specific label or fallback to English or first available
  return label[language] || label.en || Object.values(label)[0] || fieldName;
}

export default function FormRenderer({ page, onSuccess }: FormRendererProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createRecord } = useRecords(page.entity);
  const { language, t } = useLanguage();

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

  const fields = page.fields || [];

  if (fields.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">{t('message.noFields') || 'No fields configured for this form.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">{page.title}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {fields.map((field) => {
          const label = getLabel(field.label, field.name, language, t);
          const isRequired = field.required || false;
          const placeholder = field.placeholder || t(`placeholder.enter${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`, `Enter ${label.toLowerCase()}`);
          
          const baseInputClass = `
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
            ${errors[field.name] 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
            }
          `;

          return (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {/* Field rendering based on type */}
              {field.type === 'textarea' && (
                <textarea
                  {...register(field.name, { required: isRequired })}
                  placeholder={placeholder}
                  rows={4}
                  className={baseInputClass}
                />
              )}
              
              {field.type === 'select' && (
                <select
                  {...register(field.name, { required: isRequired })}
                  className={baseInputClass}
                >
                  <option value="">{t('placeholder.selectOption')}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              
              {field.type === 'number' && (
                <input
                  type="number"
                  {...register(field.name, { required: isRequired, valueAsNumber: true })}
                  placeholder={placeholder}
                  className={baseInputClass}
                />
              )}
              
              {field.type === 'email' && (
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
              )}
              
              {(field.type === 'text' || !field.type) && (
                <input
                  type="text"
                  {...register(field.name, { required: isRequired })}
                  placeholder={placeholder}
                  className={baseInputClass}
                />
              )}
              
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
          {isSubmitting ? t('action.submitting') : t('action.submit')}
        </button>
      </form>
    </div>
  );
}