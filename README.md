# Stash - Luggage Storage Platform

A Next.js application that connects many travelers with verified hosts offering secure luggage storage services.

## 🎯 Project Overview

**Stash** allows travelers to temporarily store their belongings with verified hosts (Stashers) who provide secure storage spaces. All services are booked hourly with cash payment for the MVP.

### MVP Features

- **Luggage storage only** (parking and rooms in Phase 2)
- **Walk-in service** (no delivery for MVP)
- **Cash payment** (online payments in Phase 2)
- **Leaflet maps** for location search
- **Basic admin panel** for approvals

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Maps**: Leaflet (OpenStreetMap)
- **Database Management**: MCP Server Tools
- **Deployment**: Vercel

## 📁 Project Structure

```
/app                    # Next.js App Router
  /(auth)              # Authentication pages
  /(public)            # Public pages (browse, listings)
  /(traveler)          # Traveler-only pages
  /(stasher)           # Stasher-only pages
  /(admin)             # Admin-only pages
/components            # Reusable UI components
  /ui                  # shadcn/ui components
  /map                 # Leaflet map components
/lib                   # Utilities and configurations
  /supabase           # Supabase client setup
/types                 # TypeScript type definitions
/supabase             # Database migrations and schema
AGENTS.md             # AI agent documentation
PROGRESS.md           # Development progress tracker
```

## 🗄️ Database Schema

### Core Tables

- **profiles** - User information and roles (traveler, pending_stasher, stasher, admin)
- **stasher_applications** - Verification applications with photos and documents
- **stash_listings** - Storage location listings with pricing and amenities
- **bookings** - Reservation system with hourly pricing
- **inspection_notes** - Item documentation for safety and disputes
- **reviews** - Rating and review system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- MCP server configured

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd stash

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev
```

### Database Setup

```bash
# Use MCP tools to create schema
# See AGENTS.md for detailed instructions

# Apply migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > types/database.ts
```

## 👥 User Roles & Workflows

### Traveler Flow

1. Sign up / Sign in
2. Browse nearby storage locations
3. View stash details and reviews
4. Book hourly storage
5. Drop off items (walk-in)
6. Stasher performs inspection
7. Approve inspection notes
8. Pick up items
9. Leave review

### Stasher Flow

1. Register as stasher
2. Submit verification application
3. Wait for admin approval
4. Create storage listings
5. Manage bookings
6. Perform item inspections
7. Handle drop-off/pickup
8. Receive payments (cash)

### Admin Flow

1. Review stasher applications
2. Approve/reject with notes
3. Review storage listings
4. Monitor platform activity
5. Handle disputes

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### MCP Database Operations

See [AGENTS.md](./AGENTS.md) for comprehensive database management using MCP tools.

### Key Commands

```bash
# Test MCP connection
mcp0_get_project_url()

# Create schema
mcp0_apply_migration(name="create_tables", query="CREATE TABLE...")

# Generate types
mcp0_generate_typescript_types()

# Security check
mcp0_get_advisors(type="security")
```

## 📊 Progress Tracking

See [PROGRESS.md](./PROGRESS.md) for detailed development progress and milestones.

**Current Status**: Phase 0 - Database Setup (5.6% complete)

## 🔐 Security

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** for different user types
- **Input validation** and sanitization
- **Secure file uploads** via Supabase Storage

## 🧪 Testing

### Test Data

Use MCP tools to insert test data:

```sql
-- Create test users
INSERT INTO profiles (id, role, full_name) VALUES
('test-traveler', 'traveler', 'Test Traveler'),
('test-stasher', 'stasher', 'Test Stasher');

-- Create test listings
INSERT INTO stash_listings (stasher_id, name, address, latitude, longitude, hourly_price, capacity_bags)
VALUES ('test-stasher', 'Downtown Storage', '123 Main St', 40.7128, -74.0060, 5.00, 20);
```

## 🚀 Deployment

### Vercel Deployment

```bash
# Deploy to Vercel
npx vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Production

1. Create production Supabase project
2. Apply migrations using MCP tools
3. Configure RLS policies
4. Set up file storage buckets

## 📈 Roadmap

### Phase 1: MVP (Week 1-4)

- [x] Database schema and documentation
- [ ] Authentication and user management
- [ ] Basic booking system
- [ ] Admin approval workflows

### Phase 2: Enhanced Features

- [ ] Vehicle parking support
- [ ] Stay-in room bookings
- [ ] Pickup and delivery service
- [ ] Online payment integration

### Phase 3: Advanced Features

- [ ] Real-time notifications
- [ ] Chat system
- [ ] Advanced analytics
- [ ] Mobile app

## 🤝 Contributing

1. Follow the development phases in PROGRESS.md
2. Use MCP tools for all database operations
3. Maintain TypeScript types
4. Test with different user roles
5. Update documentation

## 📝 Documentation

- [AGENTS.md](./AGENTS.md) - AI agent database management guide
- [PROGRESS.md](./PROGRESS.md) - Development progress tracker
- [Project Plan](/home/semblante/.windsurf/plans/stash-app-mcp-plan-3d43ab.md) - Detailed implementation plan

## 📞 Support

For development questions, refer to:

- AGENTS.md for database operations
- Supabase documentation for API usage
- Next.js documentation for frontend development

---

_Built with ❤️ using Next.js, Supabase, and MCP tools_
