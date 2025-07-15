# StitchCounter - Knitting Project Manager

A Progressive Web Application for managing knitting projects with customizable counters, linking features, and mobile optimization.

## Features

- **Project Management**: Create and organize multiple knitting projects
- **Smart Counters**: Configurable min/max/step values with visual indicators
- **Counter Linking**: Auto-increment counters based on other counter triggers
- **Manual Disable**: Set counters to auto-only mode
- **Mobile Optimized**: PWA with offline support and touch-friendly interface
- **Visual Feedback**: Color-coded states for maximum values, linked counters, and auto-only modes

## Deployment Instructions

### Vercel Deployment

1. Download this code as a zip file
2. Create a GitHub repository and upload the code
3. Connect your GitHub account to [Vercel](https://vercel.com)
4. Import your repository
5. Vercel will automatically detect the Vite configuration and deploy

### Local Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5000`

### Build for Production

```bash
npm run build
```

Output will be in `client/dist/` directory.

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui components
- **State**: TanStack Query + Local Storage
- **PWA**: Service Worker + Web App Manifest
- **Forms**: React Hook Form + Zod validation

## File Structure

- `client/src/components/` - React components
- `client/src/pages/` - Application pages
- `client/src/hooks/` - Custom React hooks
- `client/src/lib/` - Utility functions and storage
- `shared/schema.ts` - Data type definitions