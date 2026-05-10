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
  const [selectedValue, setSelectedValue] = useState(value || '');

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/projects');
        let projectsData = response.data.data || response.data || [];
        if (!Array.isArray(projectsData)) {
          projectsData = [];
        }
        setProjects(projectsData);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    onChange(newValue);
  };

  if (loading) {
    return (
      <select aria-label='h' disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
        <option>Loading projects...</option>
      </select>
    );
  }

  return (
    <select aria-label='jjh'
      value={selectedValue}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
    >
      <option value="">{placeholder}</option>
      {projects.map((project) => {
        const projectId = project.id;
        const projectName = project.data?.name || project.name || 'Unnamed Project';
        return (
          <option key={projectId} value={projectId}>
            {projectName}
          </option>
        );
      })}
      {projects.length === 0 && (
        <option disabled>No projects available. Create one first.</option>
      )}
    </select>
  );
}