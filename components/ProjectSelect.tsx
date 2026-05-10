'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';

interface ProjectSelectProps {
  value: string;
  onChange: (projectId: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function ProjectSelect({
  value,
  onChange,
  placeholder = 'Select a project...',
  required = false,
  disabled = false
}: ProjectSelectProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/api/projects');
        setProjects(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <select aria-label='a' disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
        <option>Loading projects...</option>
      </select>
    );
  }

  return (
    <select aria-label='h'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
    >
      <option value="">{placeholder}</option>
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.data?.name || project.name || 'Unnamed Project'}
        </option>
      ))}
      {projects.length === 0 && (
        <option disabled>No projects available. Create one first.</option>
      )}
    </select>
  );
}