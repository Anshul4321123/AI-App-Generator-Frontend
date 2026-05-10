# AI App Generator - Frontend

A dynamic, config-driven frontend application that generates UI based on JSON configuration. Create apps, manage tasks, handle team collaboration, and build custom data management interfaces without writing code.

## 🚀 Features

### Core Features
- **Dynamic Page Renderer** - Renders pages from JSON configuration
- **Dynamic Form Builder** - Auto-generates forms from field definitions
- **Dynamic Table Renderer** - Auto-generates tables with inferred columns
- **Component Registry** - Extensible component system for new UI types
- **Config Normalizer** - Graceful degradation for malformed configs
- **Fallback Renderer** - Handles unknown component types

### Authentication
- **JWT-based Authentication** with Zustand store
- **Login/Register Pages** with validation
- **Role-based UI** (Admin/Team Lead/Member views)
- **Protected Routes** with automatic redirect

### App Builder
- **Create Custom App** - Build apps from scratch
- **Task Manager Templates** - Pre-built templates for task management
- **Sprint Planner** - Agile sprint planning template
- **Personal Tasks** - Individual task tracking
- **Duplicate Name Checking** - Prevent duplicate app names

### Task Management
- **Task Dashboard** with metrics (Total, Completed, Pending, Overdue)
- **Task Creation** with multi-user assignment
- **Task Status Updates** (Todo, In Progress, Done)
- **Priority Levels** (High, Medium, Low)
- **Due Date Picker** with date validation
- **Story Points** for agile estimation
- **Project Association** for task categorization
- **Multi-User Assignment** with checkbox dropdown
- **Task Editing** with full update capability
- **Role-Based Task Filtering** (Admins see all, Members see assigned)

### Team Collaboration
- **Team Management** (Admin only)
- **User Role Management** (Admin, Team Lead, Member)
- **User Autocomplete** for task assignment
- **Role-Based Access Control** throughout the app

### CSV Import
- **Upload CSV files** for any entity
- **Column Mapping** interface
- **Progress Tracking** with progress bar
- **Import Results** with success/failure counts
- **Automatic Notifications** on import completion

### Notifications System
- **Bell Icon** with unread badge
- **Notification Dropdown** with list view
- **Mark as Read** (single or all)
- **Auto-refresh polling** every 30 seconds
- **Type-based styling** (success, warning, error, info)

### Localization
- **Multi-language Support** (English/Hindi)
- **Language Switcher** in header
- **Translation Dictionary** for UI labels
- **Fallback to English** for missing translations

### UI Components
- **MultiUserSelect** - Checkbox dropdown for multiple user selection
- **ProjectSelect** - Dynamic project dropdown
- **UserAutocomplete** - Typeahead for user search
- **LanguageSwitcher** - Toggle between languages
- **NotificationsBell** - Notification management
- **Layout** - Responsive header with navigation

### Responsive Design
- **Mobile Card View** - Card layout for small screens
- **Desktop Table View** - Table layout for larger screens
- **Tailwind CSS** for styling
- **Flexbox/Grid** for layouts

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: SVG inline
- **Deployment**: Vercel

## 📁 Project Structure
