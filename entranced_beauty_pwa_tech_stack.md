# Entranced Beauty PWA Tech Stack

## Project Type

Entranced Beauty will be built as a Progressive Web App using Lovable.dev.

It is not a native React Native app.

It should behave like an installable mobile app on iPhone and Android while still running on the web.

Clients do not create accounts.

The public experience is focused on:

- Viewing services
- Viewing prices
- Checking available dates
- Selecting available times
- Entering a name
- Entering a phone number
- Uploading an optional inspiration image
- Adding notes
- Submitting a booking request

Only the Entranced Beauty admin signs in.

---

## Recommended Tech Stack

### Framework

- TanStack Start

### Frontend

- React
- TypeScript
- Tailwind CSS
- Custom React components
- Lucide Icons

### Data and Server State

- TanStack Query

### Forms and Validation

- React Hook Form
- Zod

### Backend

- Supabase

### Database

- PostgreSQL through Supabase

### Storage

- Supabase Storage

### Authentication

- Supabase Auth
- Admin only
- No client signup
- No client login

### Backend Logic

Use:

- Supabase Edge Functions
- Secure PostgreSQL functions where appropriate

Use backend logic for important booking operations such as:

- Availability calculation
- Booking validation
- Price calculation
- Appointment duration
- Booking reference generation
- Conflict prevention

### Hosting

- Lovable Cloud
- Cloudflare-based deployment through Lovable

### Communication

- WhatsApp deep links
- Instagram links

### Currency

- NAD
- Display as N$

### Timezone

- Africa/Windhoek

---

# PWA Requirements

The application must be a proper installable Progressive Web App.

Include:

- Web App Manifest
- Service Worker
- App icons
- Apple Touch Icon
- Theme color
- Background color
- Standalone display mode
- Correct start URL
- Mobile-friendly viewport
- iOS PWA metadata
- Android install support
- Cached app shell
- Offline fallback behavior

The app should open like a standalone application when installed on a home screen.

---

# Client Authentication

Customers must not create accounts.

Do not build:

- Signup
- Login
- Password reset
- Profile
- Account settings
- Customer dashboard

A booking only needs:

- Client name
- Phone number
- Service
- Date
- Time
- Optional inspiration image
- Optional notes

Admin authentication is separate.

---

# Admin Authentication

Only the Entranced Beauty business owner or approved admins should sign in.

Use Supabase Auth.

Recommended admin route:

`/admin`

Admin should have access to:

- Bookings
- Calendar
- Services
- Prices
- Availability
- Portfolio
- Specials
- Business settings

---

# Main Public Features

## Services

Clients can:

- View all services
- View prices
- View service descriptions
- View service duration
- View available add-ons
- Search services
- Filter by category

Initial categories:

- Manicure
- Pedicure
- Makeup
- Hair

Services must come from Supabase.

Do not permanently hard-code them in the UI.

---

## Availability Calendar

Clients can:

- View available dates
- View unavailable dates
- Select a date
- View available appointment times
- Select a time

Availability should be calculated using:

- Business opening hours
- Service duration
- Existing bookings
- Blocked dates
- Blocked times
- Break periods

Do not trust client-side availability alone.

The backend must validate the selected slot again before creating the booking.

---

# Availability Architecture

Use this flow:

```txt
Supabase
    ↓
Business Hours
    ↓
Blocked Dates / Times
    ↓
Existing Bookings
    ↓
Selected Service Duration
    ↓
Availability Function
    ↓
Available Slots
    ↓
PWA Calendar
```

Example:

```txt
Business Hours
09:00 – 17:00

Existing Booking
10:00 – 11:30

Blocked Period
13:00 – 14:00

Selected Service
60 Minutes
```

The server calculates the remaining valid appointment times.

---

# Booking Flow

Use this core flow:

```txt
Services
→ Service Detail
→ Choose Date
→ Choose Time
→ Client Details
→ Inspiration
→ Booking Summary
→ Submit Booking
→ Booking Received
```

Do not add unnecessary steps.

A booking should be quick enough to complete in about one minute.

---

# Booking Form

Required fields:

- Name
- Phone number
- Service
- Date
- Time

Optional:

- Inspiration image
- Notes

Do not request unnecessary information such as:

- Password
- Username
- Date of birth
- Home address
- Gender

---

# Inspiration Upload

Use Supabase Storage.

Clients should be able to:

- Upload from photo library
- Use camera where supported
- Preview image
- Replace image
- Remove image

Before upload:

- Resize very large images
- Compress images
- Prefer WebP where practical

Recommended storage bucket:

`booking-inspiration`

Booking inspiration must not be publicly exposed.

---

# Portfolio

Use Supabase Storage and PostgreSQL.

Portfolio categories can include:

- Nails
- Pedicure
- Makeup
- Hair

Portfolio exists to show real Entranced Beauty work.

Do not create:

- Likes
- Comments
- Followers
- Social feed behavior

A portfolio item may link directly to a related service.

Possible action:

`Book This Look`

---

# Specials

Allow admin to create temporary promotions.

Suggested fields:

- Name
- Description
- Service
- Original price
- Special price
- Start date
- End date
- Active status

Expired specials should automatically stop showing.

Do not leave expired promotions visible.

---

# WhatsApp Integration

Use WhatsApp deep links.

Main use cases:

- Contact Entranced Beauty
- Ask about a service
- Follow up on a submitted booking

Example prefilled message:

```txt
Hi Entranced Beauty, I just submitted booking EB-1042 for French Manicure on 24 September at 14:00.
```

Do not build an internal chat system.

---

# Offline Behavior

The app can cache non-sensitive public content.

Safe to cache:

- Home
- Services
- Prices
- Portfolio
- Policies
- Business information

Internet required for:

- Live availability
- Booking submission
- Inspiration upload
- Admin changes

Never show a booking as successful unless the backend confirms it.

If the client is offline, show a clear message such as:

`You're offline. Connect to the internet to complete your booking.`

Do not queue bookings silently for later submission.

---

# Database Structure

Recommended Supabase tables:

```txt
business_settings

service_categories

services

service_addons

business_hours

availability_blocks

bookings

booking_services

booking_addons

booking_images

portfolio_items

specials

admin_users
```

Use proper relational tables.

Do not store the entire application state inside one large JSON column.

---

# Suggested Services Table

```txt
id
name
category_id
description
price
duration_minutes
image_url
active
booking_enabled
sort_order
deposit_amount
requires_inspiration
created_at
updated_at
```

---

# Suggested Bookings Table

```txt
id
reference
client_name
client_phone
booking_date
start_time
end_time
status
notes
estimated_total
deposit_amount
created_at
updated_at
```

Booking status can include:

```txt
pending
confirmed
rescheduled
completed
cancelled
rejected
no_show
```

New bookings should default to:

`pending`

---

# Booking Price History

Do not rely only on the current service price.

When a booking is created, save a price snapshot in the booking-related records.

This protects historical bookings when the admin later changes service prices.

---

# Phone Number Handling

The business is Namibia-based.

Default country code:

`+264`

Allow clients to enter something familiar such as:

`081 123 4567`

Normalize it before storing:

`+264811234567`

Do not force clients to manually type the international format.

---

# Security

Use Supabase Row Level Security.

Do not disable RLS.

Public users may:

- Read active services
- Read active categories
- Read public portfolio items
- Read public business settings
- Read public availability information
- Submit bookings through controlled logic

Public users must not:

- Read all bookings
- Read other clients' names
- Read other clients' phone numbers
- Read private inspiration images
- Modify services
- Modify prices
- Modify availability
- Access admin information

Admin gets authenticated permissions.

---

# Booking Conflict Protection

Prevent double booking.

When creating a booking:

1. Re-check selected service
2. Re-check service duration
3. Re-check opening hours
4. Re-check blocked periods
5. Re-check existing bookings
6. Recalculate price
7. Create the booking atomically

If the slot was taken between selection and submission, return:

`That time was just booked. Please choose another available time.`

Do not allow overlapping appointments.

---

# UI Technology

Use:

- React
- Tailwind CSS
- Custom components
- Lucide Icons
- React Hook Form
- TanStack Query

Avoid relying heavily on default component-library styling.

If shadcn primitives are used internally, restyle them completely to match the approved Entranced Beauty reference.

The app must not look like a default shadcn project.

---

# Visual Source of Truth

The supplied Beauty Hair Salon Booking UI reference is the primary UI source of truth.

Use the reference for:

- Layout
- Card proportions
- Typography hierarchy
- Spacing
- Service-list structure
- Booking flow
- Button placement
- Pink/coral usage
- Image treatment
- Navigation proportions

The product logic must still match Entranced Beauty.

Do not copy irrelevant features from the reference.

Remove:

- Customer login
- Customer signup
- Profile
- Staff selection
- Account-based appointment history
- Fake payment cards
- Fake reviews
- Multi-salon features

---

# Design Direction

The design should feel:

- Clean
- Premium
- Soft
- Modern
- Feminine
- Minimal
- Mobile-first
- iOS-influenced

Use the Dribbble reference as the main design family.

Apple influence should come from:

- Spacing
- Typography
- Motion
- Haptics where supported
- Bottom sheets
- Interaction quality
- Subtle blur
- Touch response

Do not turn the whole app into glassmorphism.

---

# Glass Usage

Use translucent materials selectively.

Good use cases:

- Bottom navigation
- Modal sheets
- Calendar overlays
- Sticky booking controls
- Floating actions

Target roughly:

```txt
20–30% translucent / glass material
70–80% clean opaque surfaces
```

Do not use glass for every card.

---

# Color Direction

Suggested starting palette:

```txt
Primary Coral
#DF7A82

Secondary Coral
#E89096

Light Blush
#FAEEEE

Soft Background
#FFF9F8

Card Background
#FFFFFF

Primary Text
#171717

Secondary Text
#777271

Soft Divider
#EFE7E5

Muted Surface
#F8F4F3
```

Adjust slightly if necessary for accessibility.

Do not introduce random purple, blue, neon or gradient-heavy styling.

---

# Bottom Navigation

Recommended public navigation:

```txt
Home
Services
Portfolio
Book
```

Do not include:

- Profile
- Appointments tied to an account
- Staff
- Social feed

---

# Admin Features

The admin side should support:

- View today's bookings
- View upcoming bookings
- View pending bookings
- Confirm bookings
- Reject bookings
- Reschedule bookings
- Cancel bookings
- Mark bookings complete
- Mark no-show
- View inspiration images
- Contact client through WhatsApp
- Manage services
- Manage prices
- Manage service duration
- Manage opening hours
- Block dates
- Block times
- Manage specials
- Manage portfolio
- Manage business settings

Keep admin functional and simple.

Do not build a giant SaaS dashboard.

---

# Error Handling

Handle:

- Offline state
- Failed booking
- Failed image upload
- Invalid phone number
- Service unavailable
- Slot already booked
- Blocked date
- Supabase failures

Do not expose raw database errors to clients.

Give simple, useful messages.

---

# Performance

Optimize:

- Images
- Supabase queries
- Calendar calculations
- Re-renders
- Portfolio loading

Use image thumbnails where appropriate.

Do not download large original images for small previews.

---

# Accessibility

Support:

- Good contrast
- Large enough touch targets
- Form labels
- Screen-reader labels
- Safe-area handling
- Keyboard handling
- Reduced-motion preferences where practical

Do not sacrifice readability for aesthetics.

---

# Strict Anti-AI-Slop Rules

Do not create:

- Generic SaaS dashboards
- Purple gradients
- Neon glows
- Giant glass cards
- Random decorative blobs
- Excessive pill buttons
- Fake metrics
- Fake testimonials
- Fake reviews
- AI-generated beauty images
- Generic stock-photo-heavy layouts
- Excessive onboarding
- Generic feature-card grids
- Random sparkle icons
- "Premium" badges
- "AI powered" labels

Do not write generic marketing copy such as:

- Elevate your beauty journey
- Unlock your inner glow
- Beauty reimagined
- Discover timeless elegance
- Seamlessly book your beauty experience

Keep copy short and natural.

---

# Strict Anti-AI-Slop Code Rules

Do not:

- Create fake APIs
- Leave mock data after Supabase is connected
- Leave TODO placeholders
- Duplicate components
- Duplicate booking logic
- Use `any` carelessly
- Ignore TypeScript errors
- Disable linting to hide issues
- Swallow backend errors
- Fake loading with `setTimeout`
- Expose Supabase service-role keys
- Disable RLS
- Trust client-generated totals
- Trust client-generated appointment duration
- Trust client-side availability

Important booking values must be verified on the backend.

---

# Implementation Order

Build in this order:

1. Project foundation
2. Supabase schema
3. RLS policies
4. Business settings
5. Services
6. Availability engine
7. Calendar
8. Booking creation
9. Inspiration upload
10. Booking confirmation
11. WhatsApp integration
12. Portfolio
13. Specials
14. Admin authentication
15. Admin bookings
16. Admin calendar
17. Admin service management
18. PWA installation support
19. Offline public-content caching
20. Final visual polish
21. Testing

Do not start by building decorative screens before the booking logic works.

---

# Final Stack Summary

```txt
Framework
TanStack Start

Frontend
React
TypeScript

Styling
Tailwind CSS
Custom Design System

State / Data
TanStack Query

Forms
React Hook Form
Zod

Backend
Supabase

Database
PostgreSQL

Storage
Supabase Storage

Authentication
Supabase Auth
Admin Only

Server Logic
Supabase Edge Functions
Secure PostgreSQL Functions

PWA
Web App Manifest
Service Worker
Standalone Installation
iOS Home Screen Support
Android Installation Support
Offline Public App Shell

Hosting
Lovable Cloud
Cloudflare-backed deployment

Icons
Lucide

Communication
WhatsApp Deep Links

Currency
NAD / N$

Timezone
Africa/Windhoek
```

---

# Final Product Principle

Entranced Beauty is not a marketplace and not a customer-account platform.

It is a direct booking PWA for one beauty business.

The entire public product should revolve around:

```txt
See Services
→ Check Availability
→ Choose Date
→ Choose Time
→ Add Details
→ Upload Inspiration
→ Submit Booking
```

Keep the product focused.

Do not add features just because other salon apps have them.

The app should feel intentionally built for Entranced Beauty.
