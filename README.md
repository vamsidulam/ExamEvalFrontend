# Frontend - Question Paper Generation System

This is the frontend application for the Question Paper Generation System built with React, TypeScript, and Vite.

## Technology Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool and Dev Server
- **Tailwind CSS** - Styling
- **Clerk** - Authentication
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local` (if available)
   - Configure your Clerk authentication keys
   - Set the backend API URL

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts
├── lib/                # Utility libraries
├── pages/              # Page components
├── services/           # API services
└── main.tsx           # Application entry point
```

## Features

- Question paper template creation and management
- Question generation using AI
- User authentication with Clerk
- Responsive design
- Type-safe development with TypeScript

## Backend Integration

The frontend communicates with the backend API running on `http://localhost:8000`. Make sure the backend server is running before using the application.

## Authentication

This application uses Clerk for authentication. Make sure to configure your Clerk keys in the environment variables as described in `CLERK_SETUP.md`.
