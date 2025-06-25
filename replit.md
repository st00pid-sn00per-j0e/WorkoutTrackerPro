# FitForge AI - Fitness Application

## Overview

FitForge AI is a comprehensive fitness application that combines AI-powered workout and nutrition planning with real-time session tracking and community features. The application uses a modern full-stack architecture with React frontend, Express backend, and PostgreSQL database, all enhanced with Google's Gemini AI for personalized fitness recommendations.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom fitness-themed color palette
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Replit Auth integration with session management

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **Authentication**: Passport.js with OpenID Connect for Replit Auth
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Connection Pooling**: Neon serverless connection pooling

## Key Components

### Authentication System
- Replit Auth integration using OpenID Connect
- Session-based authentication with PostgreSQL storage
- User profile management with automatic user creation
- Protected routes with middleware authentication checks

### AI Integration
- Google Gemini AI for workout plan generation
- Personalized nutrition plan creation
- Context-aware recommendations based on user goals and preferences
- Structured AI responses with proper exercise and meal formatting

### Workout Management
- AI-generated workout plans with daily routines
- Real-time workout session tracking with WebSocket synchronization
- Exercise progression tracking and completion status
- Timer functionality with audio notifications

### Nutrition Tracking
- AI-powered meal plan generation
- Food database for calorie and macro tracking
- Daily nutrition goal monitoring
- Water intake tracking

### Community Features
- Public workout plan sharing
- User following and social interactions
- Workout plan likes and engagement metrics
- Community discovery and trending content

### Real-time Features
- WebSocket integration for live workout timers
- Multi-device session synchronization
- Real-time progress updates

## Data Flow

### User Authentication Flow
1. User accesses protected route
2. Middleware checks session validity
3. If unauthenticated, redirects to Replit Auth
4. After successful auth, creates/updates user record
5. Establishes session and redirects to dashboard

### Workout Plan Generation Flow
1. User submits workout preferences form
2. Backend formats request for Gemini AI
3. AI generates structured workout plan
4. Plan is stored in database with user association
5. Frontend displays interactive workout schedule

### Real-time Workout Session Flow
1. User starts workout session
2. WebSocket connection established
3. Timer events broadcast to all connected clients
4. Exercise completion tracked in real-time
5. Session data persisted to database

## External Dependencies

### AI Services
- **Google Gemini AI**: Core AI functionality for workout and nutrition planning
- **API Key Management**: Environment-based configuration for secure API access

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Management**: WebSocket-compatible connection pooling

### Authentication Services
- **Replit Auth**: OpenID Connect authentication provider
- **Session Storage**: PostgreSQL-based session persistence

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Comprehensive icon library
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with TypeScript compilation
- **Development Server**: Vite dev server with HMR
- **Database**: Local PostgreSQL or Neon development instance
- **Environment**: Replit development environment with live reload

### Production Deployment
- **Build Process**: Vite production build with ESBuild server bundling
- **Runtime**: Node.js production server with optimized assets
- **Database**: Neon production PostgreSQL instance
- **Hosting**: Replit autoscale deployment
- **Port Configuration**: Port 5000 mapped to external port 80

### Environment Configuration
- Database URL for PostgreSQL connection
- Gemini API key for AI functionality
- Session secret for authentication security
- Replit domain configuration for auth callbacks

## Changelog

```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```