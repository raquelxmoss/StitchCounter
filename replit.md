# StitchCounter - Knitting Project Manager

## Overview

StitchCounter is a Progressive Web Application (PWA) designed for knitting project management. It provides customizable counters with advanced features like min/max/step controls, counter linking with automatic triggers, and manual disable options for auto-only counters. The application features enhanced UI indicators for counter states (at maximum, linked, auto-only) and robust form validation. Built as a full-stack TypeScript application with React frontend and Express backend, currently operating as a client-side application with local storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables
- **PWA Features**: Service worker for offline functionality, manifest for installability

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Module System**: ES Modules
- **Development Server**: Custom Vite integration for HMR during development
- **Storage**: Currently using in-memory storage with LocalStorage on the client
- **Database Ready**: Drizzle ORM configured for PostgreSQL (ready for future database integration)

### Data Storage Solutions
- **Current**: Browser LocalStorage for client-side persistence
- **Future Ready**: Drizzle ORM with PostgreSQL configuration in place
- **Schema**: Zod-based validation for type-safe data handling

## Key Components

### Project Management
- **Projects**: Main organizational units containing multiple counters
- **Counters**: Individual counting widgets with customizable parameters
- **Counter Linking**: Advanced feature allowing counters to automatically increment based on other counter values

### Counter Features
- Configurable min/max values with visual indicators
- Custom step increments
- Reset functionality
- Counter linking with automatic increment triggers
- Manual disable option for auto-only counters
- Visual status indicators (linked, auto-only, at maximum)
- Form validation prevents invalid configurations
- Expandable/collapsible project organization

### UI Components
- Responsive design optimized for mobile use
- Toast notifications for user feedback
- Modal dialogs for creating projects and counters
- Dropdown menus for counter actions
- Form validation with React Hook Form

## Data Flow

### Client-Side Data Management
1. **Local Storage**: Projects and counters persist in browser localStorage
2. **Query Client**: TanStack Query manages data fetching and caching
3. **Optimistic Updates**: Immediate UI updates with background persistence
4. **Form Handling**: React Hook Form with Zod validation

### Counter Operations
1. Increment/decrement operations update counter values
2. Linked counters automatically trigger when parent counter reaches trigger value
3. All changes immediately persist to localStorage
4. UI updates reflect changes with smooth animations

### Project Organization
- Projects can be expanded/collapsed for better organization
- Active/inactive project states for project management
- Counter deletion with confirmation dialogs
- Real-time counter value updates

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Hook Form
- **State Management**: TanStack Query for data fetching and caching
- **UI Framework**: Radix UI primitives with Shadcn/ui components
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Forms**: React Hook Form with Hookform Resolvers for Zod integration
- **Validation**: Zod for schema validation and type inference

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Full type safety across frontend and backend
- **Database**: Drizzle ORM and Drizzle Kit for schema management
- **Linting**: ESLint configuration for code quality

### Future Integrations
- **Database**: Neon Database (PostgreSQL) with connection pooling
- **Authentication**: Ready for user authentication system
- **API**: RESTful API structure prepared for backend integration

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend development
- Express server with TypeScript compilation via tsx
- Integrated development experience with Replit-specific tooling

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles Express server for Node.js
- Static assets served from Express in production
- Service worker enables offline functionality

### Progressive Web App
- Installable on mobile devices
- Offline-first architecture with service worker caching
- Responsive design optimized for mobile knitting use cases
- Fast loading with aggressive caching strategies

### Database Migration Strategy
- Drizzle migrations ready for PostgreSQL deployment
- Schema definitions in shared directory for type consistency
- Environment variable configuration for database URL
- Ready to transition from localStorage to full database persistence

The application is architected to be easily extensible, with clear separation between client and server code, comprehensive type safety, and a foundation ready for scaling to a full multi-user application with backend persistence.