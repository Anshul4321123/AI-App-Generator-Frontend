import { AppConfig, Page, Field } from '../types';

// Normalize a single field (ensure all properties exist)
function normalizeField(field: any, index: number): Field {
  return {
    name: field?.name || `field_${index}`,
    type: ['text', 'email', 'number', 'textarea', 'select'].includes(field?.type) ? field.type : 'text',
    label: field?.label || field?.name || `Field ${index + 1}`,
    required: field?.required === true,
    options: Array.isArray(field?.options) ? field.options : [],
    placeholder: field?.placeholder || '',
  };
}

// Normalize a single page
function normalizePage(page: any, index: number): Page {
  const validTypes = ['form', 'table'];
  const type = validTypes.includes(page?.type) ? page.type : 'form';
  
  return {
    type: type,
    entity: page?.entity || 'records',
    title: page?.title || `Page ${index + 1}`,
    fields: Array.isArray(page?.fields) 
      ? page.fields.map((field: any, i: number) => normalizeField(field, i))
      : [],
  };
}

// Main config normalizer - makes any config safe to render
export function normalizeConfig(config: any): AppConfig {
  // Handle null/undefined
  if (!config) {
    return {
      id: 'unknown',
      name: 'Untitled App',
      pages: [],
      config: {},
    };
  }

  // Handle missing pages
  const pages = Array.isArray(config.pages) ? config.pages : [];
  
  // If pages is empty but config has legacy structure, try to convert
  if (pages.length === 0 && config.type) {
    // Single page config
    return {
      id: config.id || 'unknown',
      name: config.name || 'Untitled App',
      pages: [normalizePage(config, 0)],
      config: config,
    };
  }

  return {
    id: config.id || 'unknown',
    name: config.name || 'Untitled App',
    pages: pages.map((page: any, i: number) => normalizePage(page, i)),
    config: config,
  };
}

// Validate and log config issues (for debugging)
export function validateConfig(config: any): string[] {
  const warnings: string[] = [];
  
  if (!config) {
    warnings.push('Config is null or undefined');
    return warnings;
  }
  
  if (!config.pages) {
    warnings.push('Config has no "pages" property');
  }
  
  if (Array.isArray(config.pages) && config.pages.length === 0) {
    warnings.push('Pages array is empty');
  }
  
  if (Array.isArray(config.pages)) {
    config.pages.forEach((page: any, i: number) => {
      if (!page.type) {
        warnings.push(`Page ${i} has no "type" property`);
      }
      if (!page.entity) {
        warnings.push(`Page ${i} has no "entity" property`);
      }
      if (page.type === 'form' && (!page.fields || page.fields.length === 0)) {
        warnings.push(`Form page ${i} has no fields`);
      }
    });
  }
  
  return warnings;
}