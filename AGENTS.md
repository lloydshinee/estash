# AI Agent Guide for Stash Application Database Management

This guide provides comprehensive instructions for AI agents to manage the Stash application's Supabase database using MCP (Model Context Protocol) server tools.

## Table of Contents

1. [Available MCP Tools](#available-mcp-tools)
2. [Database Schema](#database-schema)
3. [Common Workflows](#common-workflows)
4. [Best Practices](#best-practices)
5. [Error Handling](#error-handling)
6. [Integration Guidelines](#integration-guidelines)
7. [UI Component Guidelines](#ui-component-guidelines)
8. [React/Next.js Development Guidelines](#reactnextjs-development-guidelines)
9. [Progress Tracking](#progress-tracking)

---

## Available MCP Tools

### Core Database Operations

- **`mcp0_apply_migration`** - Apply DDL operations (CREATE, ALTER, DROP)
- **`mcp0_execute_sql`** - Execute DML operations (SELECT, INSERT, UPDATE, DELETE)
- **`mcp0_list_tables`** - Inspect database schema and table structure
- **`mcp0_generate_typescript_types`** - Generate TypeScript types from schema

### Monitoring & Debugging

- **`mcp0_get_advisors`** - Security and performance recommendations
- **`mcp0_get_logs`** - View database logs for debugging
- **`mcp0_get_project_url`** - Get project connection information
- **`mcp0_get_publishable_keys`** - Retrieve API keys for frontend

### Schema Management

- **`mcp0_list_extensions`** - View installed PostgreSQL extensions
- **`mcp0_list_migrations`** - View migration history
- **`mcp0_search_docs`** - Search Supabase documentation

---

## Database Schema

### Core Tables Overview

```sql
-- User profiles (extends auth.users)
profiles (id, role, full_name, phone, created_at, updated_at)

-- Stasher verification applications
stasher_applications (id, user_id, id_photo_url, space_photos[], business_name, address, description, status, admin_notes, submitted_at, reviewed_at, reviewed_by)

-- Storage location listings
stash_listings (id, stasher_id, name, description, address, latitude, longitude, hourly_price, capacity_bags, security_features[], amenities[], photos[], status, created_at, updated_at)

-- Booking reservations
bookings (id, traveler_id, stash_id, start_time, end_time, total_hours, total_price, status, qr_code, special_instructions, created_at, updated_at)

-- Item inspection documentation
inspection_notes (id, booking_id, stasher_id, item_description, item_count, condition_notes, photos[], traveler_approved, created_at, approved_at)

-- User reviews and ratings
reviews (id, booking_id, traveler_id, stasher_id, rating, comment, created_at)
```

### Detailed Schema

#### 1. Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('traveler', 'pending_stasher', 'stasher', 'admin')) DEFAULT 'traveler',
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 2. Stasher Applications Table

```sql
CREATE TABLE public.stasher_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  id_photo_url TEXT,
  space_photos TEXT[],
  business_name TEXT,
  address TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- RLS Policies
ALTER TABLE public.stasher_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON public.stasher_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications" ON public.stasher_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all applications" ON public.stasher_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 3. Stash Listings Table

```sql
CREATE TABLE public.stash_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stasher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  hourly_price DECIMAL(10, 2) NOT NULL,
  capacity_bags INTEGER NOT NULL,
  security_features TEXT[],
  amenities TEXT[],
  photos TEXT[],
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.stash_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved listings" ON public.stash_listings
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Stashers can manage own listings" ON public.stash_listings
  FOR ALL USING (auth.uid() = stasher_id);

CREATE POLICY "Admins can manage all listings" ON public.stash_listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 4. Bookings Table

```sql
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  traveler_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stash_id UUID REFERENCES public.stash_listings(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  total_hours INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  qr_code TEXT UNIQUE,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Travelers can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = traveler_id);

CREATE POLICY "Stashers can view bookings for their listings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stash_listings
      WHERE id = stash_id AND stasher_id = auth.uid()
    )
  );

CREATE POLICY "Travelers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Stashers can update booking status" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.stash_listings
      WHERE id = stash_id AND stasher_id = auth.uid()
    )
  );
```

#### 5. Inspection Notes Table

```sql
CREATE TABLE public.inspection_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  stasher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_description TEXT NOT NULL,
  item_count INTEGER,
  condition_notes TEXT,
  photos TEXT[],
  traveler_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE public.inspection_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stashers can create inspection notes" ON public.inspection_notes
  FOR INSERT WITH CHECK (auth.uid() = stasher_id);

CREATE POLICY "Booking participants can view inspection notes" ON public.inspection_notes
  FOR SELECT USING (
    auth.uid() = stasher_id OR
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND traveler_id = auth.uid()
    )
  );

CREATE POLICY "Travelers can approve inspection notes" ON public.inspection_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND traveler_id = auth.uid()
    )
  );
```

#### 6. Reviews Table

```sql
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  traveler_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stasher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Travelers can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Common Workflows

### 1. Schema Inspection and Setup

#### Check Current Database State

```sql
-- Use mcp0_list_tables to inspect current schema
-- Parameters: schemas: ["public"], verbose: true
```

#### Create Initial Schema

```sql
-- Use mcp0_apply_migration with name: "create_initial_schema"
-- Apply each table creation statement above
```

#### Generate TypeScript Types

```sql
-- Use mcp0_generate_typescript_types
-- This will create types for all tables
```

### 2. User Management Workflows

#### Create New User Profile

```sql
-- Use mcp0_execute_sql
INSERT INTO public.profiles (id, role, full_name, phone)
VALUES ('user-uuid', 'traveler', 'John Doe', '+1234567890');
```

#### Promote Traveler to PendingStasher

```sql
-- Use mcp0_execute_sql
UPDATE public.profiles
SET role = 'pending_stasher', updated_at = NOW()
WHERE id = 'user-uuid' AND role = 'traveler';
```

#### Approve PendingStasher to Stasher

```sql
-- Use mcp0_execute_sql
UPDATE public.profiles
SET role = 'stasher', updated_at = NOW()
WHERE id = 'user-uuid' AND role = 'pending_stasher';
```

#### Get User Statistics

```sql
-- Use mcp0_execute_sql
SELECT
  role,
  COUNT(*) as user_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month
FROM public.profiles
GROUP BY role;
```

### 3. Stasher Application Management

#### Submit Stasher Application

```sql
-- Use mcp0_execute_sql
INSERT INTO public.stasher_applications (
  user_id, business_name, address, description, id_photo_url, space_photos
) VALUES (
  'user-uuid',
  'Downtown Storage',
  '123 Main St, City',
  'Secure storage facility with 24/7 access',
  'https://storage.url/id-photo.jpg',
  ARRAY['https://storage.url/space1.jpg', 'https://storage.url/space2.jpg']
);
```

#### Approve Stasher Application

```sql
-- Use mcp0_execute_sql
UPDATE public.stasher_applications
SET
  status = 'approved',
  reviewed_at = NOW(),
  reviewed_by = 'admin-uuid',
  admin_notes = 'Application approved. All documents verified.'
WHERE id = 'application-uuid';

-- Also update user role
UPDATE public.profiles
SET role = 'stasher', updated_at = NOW()
WHERE id = (
  SELECT user_id FROM public.stasher_applications
  WHERE id = 'application-uuid'
);
```

#### Reject Stasher Application

```sql
-- Use mcp0_execute_sql
UPDATE public.stasher_applications
SET
  status = 'rejected',
  reviewed_at = NOW(),
  reviewed_by = 'admin-uuid',
  admin_notes = 'ID photo unclear. Please resubmit with clearer image.'
WHERE id = 'application-uuid';
```

#### Get Pending Applications

```sql
-- Use mcp0_execute_sql
SELECT
  sa.*,
  p.full_name,
  p.phone
FROM public.stasher_applications sa
JOIN public.profiles p ON sa.user_id = p.id
WHERE sa.status = 'pending'
ORDER BY sa.submitted_at ASC;
```

### 4. Stash Listing Management

#### Create New Stash Listing

```sql
-- Use mcp0_execute_sql
INSERT INTO public.stash_listings (
  stasher_id, name, description, address, latitude, longitude,
  hourly_price, capacity_bags, security_features, amenities, photos
) VALUES (
  'stasher-uuid',
  'Downtown Secure Storage',
  'Climate-controlled storage with 24/7 security',
  '123 Storage Ave, City',
  40.7128,
  -74.0060,
  5.00,
  20,
  ARRAY['CCTV', 'Security Guard', 'Access Control'],
  ARRAY['Climate Control', 'Insurance', 'Easy Access'],
  ARRAY['https://storage.url/listing1.jpg', 'https://storage.url/listing2.jpg']
);
```

#### Approve Stash Listing

```sql
-- Use mcp0_execute_sql
UPDATE public.stash_listings
SET status = 'approved', updated_at = NOW()
WHERE id = 'listing-uuid';
```

#### Get Nearby Listings

```sql
-- Use mcp0_execute_sql
SELECT
  *,
  (
    6371 * acos(
      cos(radians(40.7128)) * cos(radians(latitude)) *
      cos(radians(longitude) - radians(-74.0060)) +
      sin(radians(40.7128)) * sin(radians(latitude))
    )
  ) AS distance_km
FROM public.stash_listings
WHERE status = 'approved'
ORDER BY distance_km
LIMIT 10;
```

#### Get Listing with Average Rating

```sql
-- Use mcp0_execute_sql
SELECT
  sl.*,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as review_count
FROM public.stash_listings sl
LEFT JOIN public.reviews r ON r.stasher_id = sl.stasher_id
WHERE sl.id = 'listing-uuid'
GROUP BY sl.id;
```

### 5. Booking Management

#### Create New Booking

```sql
-- Use mcp0_execute_sql
INSERT INTO public.bookings (
  traveler_id, stash_id, start_time, end_time, total_hours, total_price, qr_code
) VALUES (
  'traveler-uuid',
  'stash-uuid',
  '2024-01-15 10:00:00+00',
  '2024-01-15 16:00:00+00',
  6,
  30.00,
  'QR_' || generate_random_uuid()
);
```

#### Confirm Booking (Stasher Action)

```sql
-- Use mcp0_execute_sql
UPDATE public.bookings
SET status = 'confirmed', updated_at = NOW()
WHERE id = 'booking-uuid';
```

#### Start Active Storage

```sql
-- Use mcp0_execute_sql
UPDATE public.bookings
SET status = 'active', updated_at = NOW()
WHERE id = 'booking-uuid' AND status = 'confirmed';
```

#### Complete Booking

```sql
-- Use mcp0_execute_sql
UPDATE public.bookings
SET status = 'completed', updated_at = NOW()
WHERE id = 'booking-uuid' AND status = 'active';
```

#### Get Booking History for Traveler

```sql
-- Use mcp0_execute_sql
SELECT
  b.*,
  sl.name as stash_name,
  sl.address,
  p.full_name as stasher_name
FROM public.bookings b
JOIN public.stash_listings sl ON b.stash_id = sl.id
JOIN public.profiles p ON sl.stasher_id = p.id
WHERE b.traveler_id = 'traveler-uuid'
ORDER BY b.created_at DESC;
```

#### Get Upcoming Bookings for Stasher

```sql
-- Use mcp0_execute_sql
SELECT
  b.*,
  sl.name as stash_name,
  p.full_name as traveler_name,
  p.phone as traveler_phone
FROM public.bookings b
JOIN public.stash_listings sl ON b.stash_id = sl.id
JOIN public.profiles p ON b.traveler_id = p.id
WHERE sl.stasher_id = 'stasher-uuid'
  AND b.status IN ('confirmed', 'active')
  AND b.start_time >= NOW()
ORDER BY b.start_time ASC;
```

### 6. Inspection Notes Management

#### Create Inspection Notes

```sql
-- Use mcp0_execute_sql
INSERT INTO public.inspection_notes (
  booking_id, stasher_id, item_description, item_count, condition_notes, photos
) VALUES (
  'booking-uuid',
  'stasher-uuid',
  '2 large suitcases, 1 backpack',
  3,
  'All items in good condition. Suitcases have minor scuffs.',
  ARRAY['https://storage.url/inspection1.jpg', 'https://storage.url/inspection2.jpg']
);
```

#### Traveler Approves Inspection

```sql
-- Use mcp0_execute_sql
UPDATE public.inspection_notes
SET traveler_approved = true, approved_at = NOW()
WHERE booking_id = 'booking-uuid';
```

#### Get Inspection Notes for Booking

```sql
-- Use mcp0_execute_sql
SELECT
  in_.*,
  p.full_name as stasher_name
FROM public.inspection_notes in_
JOIN public.profiles p ON in_.stasher_id = p.id
WHERE in_.booking_id = 'booking-uuid';
```

### 7. Reviews and Ratings

#### Create Review

```sql
-- Use mcp0_execute_sql
INSERT INTO public.reviews (
  booking_id, traveler_id, stasher_id, rating, comment
) VALUES (
  'booking-uuid',
  'traveler-uuid',
  'stasher-uuid',
  5,
  'Excellent service! Very secure and convenient location.'
);
```

#### Get Reviews for Stasher

```sql
-- Use mcp0_execute_sql
SELECT
  r.*,
  p.full_name as traveler_name
FROM public.reviews r
JOIN public.profiles p ON r.traveler_id = p.id
WHERE r.stasher_id = 'stasher-uuid'
ORDER BY r.created_at DESC;
```

#### Get Average Rating for Stasher

```sql
-- Use mcp0_execute_sql
SELECT
  stasher_id,
  AVG(rating) as average_rating,
  COUNT(*) as total_reviews
FROM public.reviews
WHERE stasher_id = 'stasher-uuid'
GROUP BY stasher_id;
```

### 8. Admin Analytics and Monitoring

#### Get Platform Statistics

```sql
-- Use mcp0_execute_sql
SELECT
  'Total Users' as metric,
  COUNT(*) as value
FROM public.profiles
UNION ALL
SELECT
  'Active Stashers',
  COUNT(*)
FROM public.profiles
WHERE role = 'stasher'
UNION ALL
SELECT
  'Approved Listings',
  COUNT(*)
FROM public.stash_listings
WHERE status = 'approved'
UNION ALL
SELECT
  'Total Bookings',
  COUNT(*)
FROM public.bookings
UNION ALL
SELECT
  'Completed Bookings',
  COUNT(*)
FROM public.bookings
WHERE status = 'completed';
```

#### Get Revenue Analytics

```sql
-- Use mcp0_execute_sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as booking_count,
  SUM(total_price) as total_revenue,
  AVG(total_price) as average_booking_value
FROM public.bookings
WHERE status = 'completed'
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

#### Get Top Performing Stashers

```sql
-- Use mcp0_execute_sql
SELECT
  p.full_name,
  COUNT(b.id) as total_bookings,
  SUM(b.total_price) as total_revenue,
  AVG(r.rating) as average_rating
FROM public.profiles p
JOIN public.stash_listings sl ON p.id = sl.stasher_id
JOIN public.bookings b ON sl.id = b.stash_id
LEFT JOIN public.reviews r ON p.id = r.stasher_id
WHERE b.status = 'completed'
  AND b.created_at >= NOW() - INTERVAL '3 months'
GROUP BY p.id, p.full_name
ORDER BY total_revenue DESC
LIMIT 10;
```

---

## Best Practices

### 1. Safety Guidelines

#### Before Making Schema Changes

1. **Always use `mcp0_list_tables`** to inspect current schema
2. **Test migrations on development** before production
3. **Backup critical data** before major changes
4. **Use transactions** for multi-step operations

#### Data Validation

```sql
-- Always validate foreign key relationships
SELECT COUNT(*) FROM public.bookings b
LEFT JOIN public.stash_listings sl ON b.stash_id = sl.id
WHERE sl.id IS NULL;

-- Check for orphaned records
SELECT COUNT(*) FROM public.inspection_notes in_
LEFT JOIN public.bookings b ON in_.booking_id = b.id
WHERE b.id IS NULL;
```

### 2. Security Best Practices

#### Use RLS Policies

- **Never disable RLS** on tables with user data
- **Test policies** with different user contexts
- **Use `mcp0_get_advisors`** regularly for security checks

#### Validate User Permissions

```sql
-- Always check user role before admin operations
SELECT role FROM public.profiles WHERE id = auth.uid();
```

### 3. Performance Optimization

#### Create Necessary Indexes

```sql
-- Use mcp0_apply_migration for index creation
CREATE INDEX idx_stash_listings_location ON public.stash_listings (latitude, longitude);
CREATE INDEX idx_bookings_traveler_status ON public.bookings (traveler_id, status);
CREATE INDEX idx_bookings_stash_time ON public.bookings (stash_id, start_time);
```

#### Monitor Query Performance

- **Use `mcp0_get_logs`** to identify slow queries
- **Run `mcp0_get_advisors`** for performance recommendations
- **Limit result sets** with appropriate WHERE clauses

### 4. Data Integrity

#### Enforce Constraints

```sql
-- Add check constraints for data validation
ALTER TABLE public.bookings
ADD CONSTRAINT check_booking_times
CHECK (end_time > start_time);

ALTER TABLE public.stash_listings
ADD CONSTRAINT check_positive_price
CHECK (hourly_price > 0);
```

#### Regular Data Audits

```sql
-- Check for inconsistent data
SELECT * FROM public.bookings
WHERE total_hours != EXTRACT(EPOCH FROM (end_time - start_time))/3600;
```

---

## Error Handling

### Common Issues and Solutions

#### 1. Migration Failures

**Issue**: Migration fails due to existing data

```sql
-- Solution: Handle existing data before schema changes
UPDATE table_name SET column_name = default_value WHERE column_name IS NULL;
ALTER TABLE table_name ALTER COLUMN column_name SET NOT NULL;
```

#### 2. Permission Errors

**Issue**: RLS policy blocks legitimate operations

```sql
-- Solution: Check and update RLS policies
SELECT * FROM pg_policies WHERE tablename = 'table_name';
```

#### 3. Foreign Key Violations

**Issue**: Cannot insert due to missing referenced record

```sql
-- Solution: Verify referenced records exist
SELECT EXISTS(SELECT 1 FROM referenced_table WHERE id = 'referenced_id');
```

#### 4. Performance Issues

**Issue**: Queries running slowly

```sql
-- Solution: Add appropriate indexes
EXPLAIN ANALYZE SELECT * FROM table_name WHERE frequently_queried_column = 'value';
```

### Debugging Workflow

1. **Use `mcp0_get_logs`** to identify the error
2. **Check recent migrations** with `mcp0_list_migrations`
3. **Verify table structure** with `mcp0_list_tables`
4. **Run security audit** with `mcp0_get_advisors`
5. **Test fixes** on development environment first

---

## Integration Guidelines

### Frontend Integration

#### Type Generation

```bash
# After schema changes, always regenerate types
# Use mcp0_generate_typescript_types
```

#### API Key Management

```bash
# Get publishable keys for frontend
# Use mcp0_get_publishable_keys
```

### Backend Considerations

#### Real-time Subscriptions

```sql
-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inspection_notes;
```

#### File Upload Handling

```sql
-- Store file URLs, not file data in database
-- Use Supabase Storage for actual files
UPDATE public.stash_listings
SET photos = ARRAY['https://storage.supabase.co/bucket/file1.jpg']
WHERE id = 'listing-uuid';
```

### Testing Workflow

#### End-to-End Testing

1. **Create test users** with different roles
2. **Test complete workflows** (signup → application → booking → review)
3. **Verify RLS policies** work correctly
4. **Check data consistency** after operations

#### Performance Testing

1. **Insert sample data** at scale
2. **Test query performance** with realistic data volumes
3. **Monitor resource usage** during peak operations

---

## Quick Reference

### Essential MCP Commands

```bash
# Schema inspection
mcp0_list_tables(schemas=["public"], verbose=true)

# Apply schema changes
mcp0_apply_migration(name="migration_name", query="SQL_STATEMENT")

# Execute queries
mcp0_execute_sql(query="SELECT * FROM table")

# Generate types
mcp0_generate_typescript_types()

# Security check
mcp0_get_advisors(type="security")

# Performance check
mcp0_get_advisors(type="performance")

# View logs
mcp0_get_logs(service="postgres")
```

### Common Query Patterns

```sql
-- User management
SELECT * FROM public.profiles WHERE role = 'pending_stasher';

-- Booking analytics
SELECT COUNT(*), status FROM public.bookings GROUP BY status;

-- Location search
SELECT * FROM public.stash_listings
WHERE ST_DWithin(ST_Point(longitude, latitude), ST_Point(-74.0060, 40.7128), 1000);

-- Revenue calculation
SELECT SUM(total_price) FROM public.bookings WHERE status = 'completed';
```

---

## UI Component Guidelines

### shadcn/ui Integration

When working with UI components, forms, or any shadcn/ui related tasks in the Stash application:

**ALWAYS use the `shadcn` skill** for:

- Adding new shadcn/ui components
- Modifying existing component configurations
- Troubleshooting component issues
- Styling and theming components
- Form implementations with shadcn/ui
- Component composition and patterns

#### Usage Examples

```bash
# Use the shadcn skill when:
- "Add a new button component"
- "Create a booking form with shadcn"
- "Fix the card component styling"
- "Update the theme configuration"
- "Add a new dialog component"
```

#### Integration with Database Operations

When building UI components that interact with the database:

1. **First** - Use shadcn skill for component structure
2. **Then** - Use MCP tools for database operations
3. **Finally** - Generate TypeScript types for type safety

This ensures consistent UI patterns while maintaining proper database integration.

---

## React/Next.js Development Guidelines

### Critical: Use Vercel React Best Practices

**MANDATORY**: When working on any React/Next.js code in the Stash application, you MUST apply the Vercel React best practices from the `vercel-react-best-practices` skill. These guidelines are prioritized by performance impact and are essential for production-grade applications.

### Performance Priority Categories

#### 1. Eliminating Waterfalls (CRITICAL Priority)

**Always apply these patterns first - they have the highest performance impact:**

##### Async Operations

```typescript
// ❌ Bad: Sequential awaits create waterfalls
async function getBookingData(bookingId: string) {
  const booking = await getBooking(bookingId);
  const stash = await getStash(booking.stash_id);
  const traveler = await getTraveler(booking.traveler_id);
  return { booking, stash, traveler };
}

// ✅ Good: Parallel execution with Promise.all
async function getBookingData(bookingId: string) {
  const booking = await getBooking(bookingId);
  const [stash, traveler] = await Promise.all([
    getStash(booking.stash_id),
    getTraveler(booking.traveler_id),
  ]);
  return { booking, stash, traveler };
}
```

##### Server Components - Start Promises Early

```typescript
// ❌ Bad: Awaiting immediately
export default async function BookingPage({
  params,
}: {
  params: { id: string };
}) {
  const booking = await getBooking(params.id);
  const stash = await getStash(booking.stash_id);
  // ...
}

// ✅ Good: Start promises early, await late
export default async function BookingPage({
  params,
}: {
  params: { id: string };
}) {
  const bookingPromise = getBooking(params.id);
  const booking = await bookingPromise;
  const stashPromise = getStash(booking.stash_id);

  const stash = await stashPromise;
  // ...
}
```

##### Suspense Boundaries for Streaming

```typescript
// ✅ Use Suspense to stream content and avoid waterfalls
export default function BookingsPage() {
  return (
    <div>
      <h1>Your Bookings</h1>
      <Suspense fallback={<BookingsSkeleton />}>
        <BookingsList />
      </Suspense>
      <Suspense fallback={<ReviewsSkeleton />}>
        <RecentReviews />
      </Suspense>
    </div>
  );
}
```

#### 2. Bundle Size Optimization (CRITICAL Priority)

##### Direct Imports - Avoid Barrel Files

```typescript
// ❌ Bad: Barrel imports can bundle unnecessary code
import { Button, Card, Dialog } from "@/components/ui";

// ✅ Good: Direct imports for better tree-shaking
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
```

##### Dynamic Imports for Heavy Components

```typescript
// ✅ Use next/dynamic for heavy components
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});

const BookingForm = dynamic(() => import('@/components/booking-form'), {
  loading: () => <FormSkeleton />
});
```

##### Defer Third-Party Scripts

```typescript
// ✅ Load analytics after hydration
"use client";

import { useEffect } from "react";

export default function Analytics() {
  useEffect(() => {
    // Load analytics only after hydration
    import("@/lib/analytics").then(({ initAnalytics }) => {
      initAnalytics();
    });
  }, []);

  return null;
}
```

#### 3. Server-Side Performance (HIGH Priority)

##### React.cache() for Deduplication

```typescript
// ✅ Use React.cache for per-request deduplication
import { cache } from "react";

export const getStashListings = cache(async (filters: ListingFilters) => {
  const { data } = await supabase
    .from("stash_listings")
    .select("*")
    .match(filters);
  return data;
});
```

##### Parallel Data Fetching in Components

```typescript
// ❌ Bad: Sequential fetching in components
export default async function StashPage({ params }: { params: { id: string } }) {
  const stash = await getStash(params.id);
  const reviews = await getReviews(params.id);
  const nearbyStashes = await getNearbyStashes(stash.latitude, stash.longitude);

  return <StashDetails stash={stash} reviews={reviews} nearby={nearbyStashes} />;
}

// ✅ Good: Parallel fetching
export default async function StashPage({ params }: { params: { id: string } }) {
  const [stash, reviews, nearbyStashes] = await Promise.all([
    getStash(params.id),
    getReviews(params.id),
    getNearbyStashes(stash.latitude, stash.longitude) // Note: This still creates a waterfall
  ]);

  return <StashDetails stash={stash} reviews={reviews} nearby={nearbyStashes} />;
}

// ✅ Better: Restructure to avoid waterfall
export default async function StashPage({ params }: { params: { id: string } }) {
  const stash = await getStash(params.id);

  const [reviews, nearbyStashes] = await Promise.all([
    getReviews(params.id),
    getNearbyStashes(stash.latitude, stash.longitude)
  ]);

  return <StashDetails stash={stash} reviews={reviews} nearby={nearbyStashes} />;
}
```

##### Minimize RSC Props Serialization

```typescript
// ❌ Bad: Passing large objects to client components
<ClientBookingForm booking={fullBookingWithAllRelations} />

// ✅ Good: Pass only necessary data
<ClientBookingForm
  bookingId={booking.id}
  stashName={booking.stash.name}
  price={booking.total_price}
/>
```

#### 4. Client-Side Data Fetching (MEDIUM-HIGH Priority)

##### SWR for Request Deduplication

```typescript
// ✅ Use SWR for automatic deduplication and caching
import useSWR from 'swr';

function BookingsList() {
  const { data: bookings, error } = useSWR('/api/bookings', fetcher);

  if (error) return <div>Failed to load bookings</div>;
  if (!bookings) return <div>Loading...</div>;

  return (
    <div>
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

##### Passive Event Listeners

```typescript
// ✅ Use passive listeners for scroll events
useEffect(() => {
  const handleScroll = () => {
    // Handle scroll
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
```

#### 5. Re-render Optimization (MEDIUM Priority)

##### Memoization Patterns

```typescript
// ✅ Extract expensive work into memoized components
const ExpensiveBookingCalculations = memo(function ExpensiveBookingCalculations({
  bookings
}: { bookings: Booking[] }) {
  const calculations = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      // Expensive calculations
      return acc;
    }, {});
  }, [bookings]);

  return <div>{/* Render calculations */}</div>;
});

// ✅ Hoist default non-primitive props
const DEFAULT_FILTERS = { status: 'active' };

function BookingsList({ filters = DEFAULT_FILTERS }: { filters?: BookingFilters }) {
  // Component logic
}
```

##### Derived State Optimization

```typescript
// ❌ Bad: Subscribing to raw values causes unnecessary re-renders
function BookingStatus({ booking }: { booking: Booking }) {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setIsExpired(new Date() > new Date(booking.end_time));
  }, [booking]); // Re-runs on any booking change

  return <div>{isExpired ? 'Expired' : 'Active'}</div>;
}

// ✅ Good: Subscribe to derived boolean
function BookingStatus({ booking }: { booking: Booking }) {
  const isExpired = useMemo(() =>
    new Date() > new Date(booking.end_time),
    [booking.end_time] // Only re-runs when end_time changes
  );

  return <div>{isExpired ? 'Expired' : 'Active'}</div>;
}
```

##### useTransition for Non-Urgent Updates

```typescript
// ✅ Use startTransition for non-urgent updates
import { useTransition, startTransition } from 'react';

function SearchFilters({ onFiltersChange }: { onFiltersChange: (filters: any) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (newFilters: any) => {
    startTransition(() => {
      onFiltersChange(newFilters); // Non-urgent update
    });
  };

  return (
    <div>
      {/* Filter UI */}
      {isPending && <div>Updating results...</div>}
    </div>
  );
}
```

### Application-Specific Guidelines

#### Database Integration Patterns

##### Server Actions with Authentication

```typescript
// ✅ Always authenticate server actions
"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createBooking(formData: FormData) {
  const supabase = createServerActionClient({ cookies });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Proceed with booking creation
  const { data, error } = await supabase.from("bookings").insert({
    traveler_id: user.id,
    // ... other fields
  });

  if (error) throw error;
  return data;
}
```

##### Optimistic Updates with SWR

```typescript
// ✅ Implement optimistic updates for better UX
import { mutate } from 'swr';

function BookingCard({ booking }: { booking: Booking }) {
  const handleStatusUpdate = async (newStatus: string) => {
    // Optimistic update
    mutate('/api/bookings',
      (bookings: Booking[]) =>
        bookings.map(b =>
          b.id === booking.id ? { ...b, status: newStatus } : b
        ),
      false // Don't revalidate immediately
    );

    try {
      await updateBookingStatus(booking.id, newStatus);
      // Revalidate on success
      mutate('/api/bookings');
    } catch (error) {
      // Revert on error
      mutate('/api/bookings');
      throw error;
    }
  };

  return (
    <Card>
      {/* Booking UI */}
      <Button onClick={() => handleStatusUpdate('confirmed')}>
        Confirm Booking
      </Button>
    </Card>
  );
}
```

#### File Structure and Organization

```
app/
├── (auth)/                    # Route groups for auth pages
│   ├── login/
│   └── signup/
├── (dashboard)/              # Protected dashboard routes
│   ├── admin/
│   ├── stasher/
│   └── traveler/
├── browse/                   # Public browse pages
├── listings/
│   └── [id]/
├── api/                      # API routes
│   ├── bookings/
│   └── listings/
├── globals.css
├── layout.tsx               # Root layout
└── page.tsx                # Landing page

components/
├── ui/                      # shadcn/ui components
├── forms/                   # Form components
├── maps/                    # Map-related components
└── booking/                 # Booking-specific components

lib/
├── supabase/               # Supabase clients
├── utils.ts                # Utility functions
└── validations.ts          # Zod schemas
```

### Code Quality Standards

#### TypeScript Integration

```typescript
// ✅ Use generated database types
import type { Database } from "@/types/database";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

// ✅ Create specific types for components
interface BookingCardProps {
  booking: Booking & {
    stash_listings: {
      name: string;
      address: string;
    };
  };
  onStatusChange?: (bookingId: string, status: string) => void;
}
```

#### Error Boundaries and Loading States

```typescript
// ✅ Implement proper error boundaries
'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert" className="p-4 border border-red-200 rounded">
      <h2>Something went wrong:</h2>
      <pre className="text-red-600">{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<BookingsSkeleton />}>
        <BookingsList />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Performance Monitoring

#### Bundle Analysis

```bash
# Add to package.json scripts
"analyze": "ANALYZE=true next build"

# Run bundle analysis
npm run analyze
```

#### Core Web Vitals Tracking

```typescript
// ✅ Track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

function sendToAnalytics(metric: any) {
  // Send to your analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Development Workflow

1. **Before Writing Code**: Review relevant Vercel best practices
2. **During Development**: Apply performance patterns by priority
3. **Code Review**: Check for waterfall patterns and bundle optimizations
4. **Testing**: Verify performance with realistic data volumes
5. **Deployment**: Monitor Core Web Vitals and bundle size

### Integration with Existing Guidelines

- **Database Operations**: Use MCP tools for schema management
- **UI Components**: Apply shadcn skill for component implementation
- **Performance**: Follow Vercel best practices for optimization
- **Progress Tracking**: Update PROGRESS.md with performance improvements

---

## Progress Tracking

### Important: Update Progress Documentation

**CRITICAL**: Every time you complete a task or milestone, you MUST update the progress documentation:

1. **Update PROGRESS.md** - Mark completed tasks and update percentages
2. **Create Memory** - Save milestone achievements for future reference
3. **Update Todo Lists** - Mark items as completed and add new tasks

### Progress Update Workflow

```bash
# When completing a task:
1. Mark task as completed in PROGRESS.md
2. Update overall progress percentage
3. Update current sprint status
4. Add completion timestamp
5. Create memory with achievement details
```

### Progress Documentation Files

- **`PROGRESS.md`** - Main progress tracking file with phases and tasks
- **`AGENTS.md`** - This file with agent guidelines and workflows
- **Memory System** - Persistent storage of milestones and achievements

### Example Progress Update

```markdown
### Phase 1: Next.js Foundation (Day 3-4) ✅ COMPLETE

- [x] ✅ Set up Supabase client configuration with TypeScript types
- [x] ✅ Implement authentication with role selection
- [x] ✅ Create role-based dashboard pages

**Progress**: 8/8 tasks (100%) ✅
```

### Milestone Memory Template

```
Title: [Phase Name] Completion - [Brief Description]
Content:
- ✅ [Completed Feature 1]
- ✅ [Completed Feature 2]
- Next: [Next Phase Goals]
Tags: ["phase_completion", "milestone", "feature_name"]
```

---

## OpenCode Configuration

### Overview

The Stash application supports both Windsurf/Cascade and OpenCode AI platforms. OpenCode configuration files have been added to enable seamless migration and dual-platform compatibility.

### Configuration Files

#### OpenCode MCP Configuration (`opencode.json`)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "http://localhost:8000/mcp",
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

**Configuration Details:**

- **Type**: `remote` - Connects to external MCP server
- **URL**: `http://localhost:8000/mcp` - Local Supabase MCP server endpoint
- **Enabled**: `true` - Server is active and available
- **Timeout**: `30000ms` - Connection timeout for reliability

#### OpenCode Skills Structure

Skills are located in `.opencode/skills/` with the following structure:

```
.opencode/skills/
├── vercel-react-best-practices/
│   ├── SKILL.md
│   ├── rules/
│   └── metadata.json
└── shadcn/
    └── SKILL.md
```

**Available Skills:**

- **vercel-react-best-practices**: React and Next.js performance optimization guidelines
- **shadcn**: Component management for shadcn/ui projects

### Migration from Windsurf/Cascade

#### Compatibility Matrix

| Feature             | Windsurf/Cascade  | OpenCode            | Status        |
| ------------------- | ----------------- | ------------------- | ------------- |
| MCP Servers         | `mcp.json`        | `opencode.json`     | ✅ Migrated   |
| Skills              | `.agents/skills/` | `.opencode/skills/` | ✅ Migrated   |
| Database Operations | MCP tools         | MCP tools           | ✅ Compatible |
| TypeScript Types    | Generated         | Generated           | ✅ Compatible |

#### File Mapping

| Windsurf/Cascade   | OpenCode              | Purpose                       |
| ------------------ | --------------------- | ----------------------------- |
| `mcp.json`         | `opencode.json`       | MCP server configuration      |
| `skills-lock.json` | N/A (auto-discovered) | Skill dependency management   |
| `.agents/skills/`  | `.opencode/skills/`   | Skill definitions and content |

### OpenCode-Specific Features

#### Skill Discovery

OpenCode automatically discovers skills from multiple locations:

- Project: `.opencode/skills/<name>/SKILL.md`
- Project (Claude-compatible): `.claude/skills/<name>/SKILL.md`
- Project (Agent-compatible): `.agents/skills/<name>/SKILL.md`
- Global: `~/.config/opencode/skills/<name>/SKILL.md`

#### Skill Permissions

Configure skill permissions in `opencode.json`:

```json
{
  "permission": {
    "skill": {
      "*": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```

#### MCP Server Types

OpenCode supports multiple MCP server types:

- **Local**: `npx` commands and local executables
- **Remote**: HTTP/HTTPS endpoints (current setup)
- **OAuth**: Authenticated remote servers

### Usage Guidelines

#### For OpenCode Users

1. **Skill Invocation**: Use `skill({ name: "skill-name" })` to invoke skills
2. **MCP Operations**: All existing MCP tools work identically
3. **Configuration**: Modify `opencode.json` for server settings

#### For Windsurf/Cascade Users

1. **Dual Compatibility**: Both configurations coexist safely
2. **Migration Path**: OpenCode files supplement existing setup
3. **No Disruption**: Existing workflows remain functional

### Troubleshooting

#### Common Issues

**Skill Not Found:**

- Verify `SKILL.md` exists in correct location
- Check frontmatter includes `name` and `description`
- Ensure skill name matches directory name

**MCP Connection Failed:**

- Verify Supabase MCP server is running on `localhost:8000`
- Check network connectivity and firewall settings
- Review timeout settings in configuration

**Schema Warnings:**

- OpenCode schema URL warnings are expected and don't affect functionality
- Warnings occur due to remote schema validation

#### Validation Commands

```bash
# Check OpenCode configuration
cat opencode.json

# Verify skill structure
ls -la .opencode/skills/*/SKILL.md

# Test MCP connectivity
curl http://localhost:8000/mcp
```

### Best Practices

#### Configuration Management

1. **Version Control**: Include `opencode.json` in repository
2. **Environment Variables**: Use for sensitive MCP server credentials
3. **Documentation**: Keep skill descriptions current and specific

#### Skill Development

1. **Naming**: Use lowercase with hyphens (e.g., `my-skill`)
2. **Descriptions**: Be specific for accurate skill selection
3. **Frontmatter**: Include all required fields (`name`, `description`)
4. **Content**: Provide clear usage examples and guidelines

#### Migration Strategy

1. **Gradual Transition**: Maintain both configurations during migration
2. **Testing**: Verify all functionality works in OpenCode environment
3. **Team Communication**: Document platform preferences and requirements
4. **Cleanup**: Remove old configurations once migration is complete

---

This guide provides comprehensive coverage of database operations for the Stash application. Always test changes in development before applying to production, and use the MCP advisor tools to maintain security and performance standards.

**Remember**: Documentation is as important as code - keep progress tracking up to date!
