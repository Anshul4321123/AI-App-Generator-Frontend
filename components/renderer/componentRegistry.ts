import { ComponentType } from 'react';
import FormRenderer from './FormRenderer';
import TableRenderer from './TableRenderer';
import FallbackRenderer from './FallbackRenderer';

// Component registry - add new component types here
export const componentRegistry: Record<string, ComponentType<any>> = {
  form: FormRenderer,
  table: TableRenderer,
};

// Helper to get component with fallback
export function getComponent(type: string): ComponentType<any> {
  return componentRegistry[type] || FallbackRenderer;
}