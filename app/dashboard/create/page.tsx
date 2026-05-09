'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

interface Field {
  name: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select';
  required: boolean;
}

interface Template {
  name: string;
  description: string;
  entity: string;
  fields: Field[];
}

const templates: Template[] = [
  {
    name: 'CRM',
    description: 'Customer Relationship Management',
    entity: 'customers',
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
      { name: 'phone', type: 'text', required: false },
      { name: 'city', type: 'text', required: false },
      { name: 'status', type: 'select', required: true },
    ],
  },
  {
    name: 'Inventory',
    description: 'Product Inventory Management',
    entity: 'products',
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'price', type: 'number', required: true },
      { name: 'stock', type: 'number', required: false },
      { name: 'description', type: 'textarea', required: false },
    ],
  },
  {
    name: 'Task Manager',
    description: 'Todo and Task Management',
    entity: 'tasks',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'priority', type: 'select', required: true },
      { name: 'due_date', type: 'text', required: false },
      { name: 'description', type: 'textarea', required: false },
    ],
  },
];

export default function CreateAppPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [appName, setAppName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [entityName, setEntityName] = useState('');
  const [fields, setFields] = useState<Field[]>([
    { name: 'name', type: 'text', required: true },
  ]);

  const addField = () => {
    setFields([...fields, { name: '', type: 'text', required: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    setFields(fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ));
  };

  const loadTemplate = (templateName: string) => {
    if (templateName === 'custom') {
      setEntityName('');
      setFields([{ name: 'name', type: 'text', required: true }]);
      return;
    }
    
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setEntityName(template.entity);
      setFields(template.fields);
    }
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    loadTemplate(value);
  };

  const generateConfig = () => {
    const formFields = fields.map(field => ({
      name: field.name,
      type: field.type,
      label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
      required: field.required,
    }));

    return {
      pages: [
        {
          type: 'form',
          entity: entityName,
          title: `Add ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
          fields: formFields,
        },
        {
          type: 'table',
          entity: entityName,
          title: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} List`,
        },
      ],
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appName.trim()) {
      setError('App name is required');
      return;
    }
    
    if (!entityName.trim()) {
      setError('Entity name is required');
      return;
    }
    
    const validFields = fields.filter(f => f.name.trim());
    if (validFields.length === 0) {
      setError('At least one field is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const config = generateConfig();
      
      const response = await api.post('/api/apps', {
        name: appName,
        config,
      });
      
      const newApp = response.data.data;
      router.push(`/app/${newApp.id}`);
    } catch (err: any) {
      console.error('Failed to create app:', err);
      setError(err.response?.data?.error || 'Failed to create app');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New App</h1>
        <p className="text-gray-600 mt-1">Generate a dynamic app with forms and tables automatically</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* App Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            App Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="e.g., Customer CRM, Product Inventory"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quick Start Template
          </label>
          <select
          aria-label='Template'
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="custom">Custom (Start from scratch)</option>
            {templates.map((template) => (
              <option key={template.name} value={template.name}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entity Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value.toLowerCase())}
            placeholder="e.g., customers, products, tasks"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be used as the table/collection name in your database
          </p>
        </div>

        {/* Fields Builder */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Fields
            </label>
            <button
              type="button"
              onClick={addField}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Field
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value.toLowerCase() })}
                    placeholder="Field name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="w-32">
                  <select
                  aria-label='feild'
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value as Field['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                      className="rounded"
                    />
                    Required
                  </label>
                  <button
                  aria-label='remove-field'
                    type="button"
                    onClick={() => removeField(index)}
                    className="text-red-600 hover:text-red-700"
                    disabled={fields.length === 1}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Config Preview */}
        <div className="border-t border-gray-200 pt-6">
          <details className="group">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
              Show Config Preview
            </summary>
            <pre className="mt-3 p-4 bg-gray-900 text-gray-200 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(generateConfig(), null, 2)}
            </pre>
          </details>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating App...' : '🚀 Create App'}
        </button>
      </form>

      {/* Back to Dashboard */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}