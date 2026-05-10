export interface TaskManagerConfig {
  appName: string;
  teamId?: string;
  includeProjects?: boolean;
}

export function generateTaskManagerConfig(config: TaskManagerConfig) {
  const { appName, teamId, includeProjects = true } = config;
  
  const pages: any[] = [];
  
  // Tasks Form with multi-user assignment and project selection
  pages.push({
    type: 'form',
    entity: 'tasks',
    title: 'Create New Task',
    fields: [
      { name: 'title', type: 'text', label: 'Task Title', required: true },
      { 
        name: 'status', 
        type: 'select', 
        label: 'Status', 
        required: true,
        options: [
          { value: 'todo', label: 'To Do' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'done', label: 'Done' }
        ]
      },
      { 
        name: 'priority', 
        type: 'select', 
        label: 'Priority',
        options: [
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' }
        ]
      },
      { 
        name: 'assigned_users', 
        type: 'multi-select', 
        label: 'Assigned Users',
        required: false,
        placeholder: 'Select team members to assign'
      },
      { 
        name: 'project_id', 
        type: 'project-select', 
        label: 'Project',
        required: false,
        placeholder: 'Select a project'
      },
      { name: 'due_date', type: 'date', label: 'Due Date' },
      { name: 'story_points', type: 'number', label: 'Story Points' },
      { name: 'description', type: 'textarea', label: 'Description' }
    ]
  });
  
  // Tasks Table
  pages.push({
    type: 'table',
    entity: 'tasks',
    title: 'Task Board'
  });
  
  // Sprints
  pages.push({
    type: 'form',
    entity: 'sprints',
    title: 'Create Sprint',
    fields: [
      { name: 'name', type: 'text', label: 'Sprint Name', required: true },
      { name: 'goal', type: 'textarea', label: 'Sprint Goal' },
      { name: 'start_date', type: 'date', label: 'Start Date' },
      { name: 'end_date', type: 'date', label: 'End Date' },
      { name: 'story_points_total', type: 'number', label: 'Total Story Points' }
    ]
  });
  
  pages.push({
    type: 'table',
    entity: 'sprints',
    title: 'Sprints'
  });
  
  if (includeProjects) {
    pages.push({
      type: 'form',
      entity: 'projects',
      title: 'Create Project',
      fields: [
        { name: 'name', type: 'text', label: 'Project Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { 
          name: 'status', 
          type: 'select', 
          label: 'Status',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'on_hold', label: 'On Hold' }
          ]
        }
      ]
    });
    
    pages.push({
      type: 'table',
      entity: 'projects',
      title: 'Projects'
    });
  }
  
  return {
    name: appName,
    config: {
      pages,
      teamId: teamId || null,
      type: 'task-manager'
    }
  };
}

// Pre-built templates
export const taskManagerTemplates = {
  personal: {
    name: 'Personal Tasks',
    description: 'Simple task manager for personal use',
    generate: (appName?: string) => generateTaskManagerConfig({ 
      appName: appName || 'My Tasks', 
      includeProjects: false 
    })
  },
  team: {
    name: 'Team Task Manager',
    description: 'Complete team task management with sprints',
    generate: (appName?: string, teamId?: string) => generateTaskManagerConfig({ 
      appName: appName || 'Team Tasks', 
      teamId, 
      includeProjects: true 
    })
  },
  sprint: {
    name: 'Sprint Planner',
    description: 'Agile sprint planning with story points',
    generate: (appName?: string) => ({
      name: appName || 'Sprint Planner',
      config: {
        pages: [
          {
            type: 'form',
            entity: 'sprints',
            title: 'Create Sprint',
            fields: [
              { name: 'name', type: 'text', label: 'Sprint Name', required: true },
              { name: 'goal', type: 'textarea', label: 'Sprint Goal' },
              { name: 'start_date', type: 'date', label: 'Start Date' },
              { name: 'end_date', type: 'date', label: 'End Date' }
            ]
          },
          {
            type: 'table',
            entity: 'sprints',
            title: 'Sprints'
          },
          {
            type: 'form',
            entity: 'tasks',
            title: 'Add Task to Sprint',
            fields: [
              { name: 'title', type: 'text', label: 'Task Title', required: true },
              { 
                name: 'status', 
                type: 'select', 
                label: 'Status',
                options: [
                  { value: 'todo', label: 'To Do' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'done', label: 'Done' }
                ]
              },
              { name: 'story_points', type: 'number', label: 'Story Points' },
              { 
                name: 'assigned_users', 
                type: 'multi-select', 
                label: 'Assigned Users' 
              }
            ]
          },
          {
            type: 'table',
            entity: 'tasks',
            title: 'Sprint Backlog'
          }
        ],
        type: 'sprint-planner'
      }
    })
  }
};