# Entranced Beauty
## Lovable Master Build / Rebuild Prompt

You are working on an existing Entranced Beauty PWA.

Your job is NOT to invent a new product.

Your job is to preserve the existing working app logic and rebuild/refine the frontend so it matches the supplied Beauty Hair Salon Booking UI reference as closely as possible while keeping Entranced Beauty's real business model.

The attached UI reference images are the visual source of truth.

The current Entranced Beauty codebase is the functional source of truth.

Do not replace correct business logic just to make the app look more like the reference.

---

# 1. Core Product

Entranced Beauty is a direct booking PWA for one beauty business.

It is NOT:

- a marketplace
- a salon directory
- a multi-staff platform
- a customer account app
- a social network
- a loyalty platform
- an e-commerce store
- a SaaS dashboard

Public customers do not create accounts.

There is:

- no customer signup
- no customer login
- no customer profile
- no customer password
- no customer dashboard

Only the business admin has authentication.

The public client flow is:

```txt
See Services
→ Choose Service
→ Check Available Date
→ Choose Time
→ Add Name
→ Add Phone Number
→ Upload Optional Inspiration
→ Add Optional Notes
→ Review
→ Submit Booking
```

Keep this flow simple and fast.

---

# 2. Existing Stack

Do not rewrite the application into another stack unless absolutely necessary.

Preserve the existing architecture.

Current stack:

```txt
Next.js 16
React 19
TypeScript
Tailwind CSS 4
PostgreSQL
Drizzle ORM
TanStack Query
React Hook Form
Zod
Lucide Icons
date-fns
PWA manifest
Next.js API routes
```

The application currently follows:

```txt
Next.js
→ Next.js API routes
→ Drizzle ORM
→ PostgreSQL
```

Do not force Supabase into the project.

Do not replace Drizzle.

Do not replace PostgreSQL.

Do not replace working API routes.

Do not rewrite stable business logic only because another architecture is more fashionable.

Improve what exists.

---

# 3. Current Functional Areas

Preserve and refine the existing routes and behavior.

Public:

```txt
/
 /book
 /services
 /services/[slug]
 /portfolio
 /contact
 /policies
```

Admin:

```txt
/admin
/admin/calendar
/admin/services
/admin/portfolio
/admin/specials
```

APIs:

```txt
/api/availability
/api/bookings
/api/bookings/quote
```

Booking feature structure already exists around:

```txt
service-step
schedule-step
details-step
review-step
booking-flow
```

Do not collapse all booking logic into one component.

Do not destroy this separation.

---

# 4. Source of Truth Priority

When instructions conflict, use this priority:

1. Attached Beauty Hair Salon Booking UI reference images
2. Entranced Beauty actual business requirements
3. Existing working booking logic
4. Existing current codebase architecture
5. Entranced Beauty brand colors and content
6. Apple-level interaction quality
7. Previous prompts or generated UI ideas

The reference images define the visual language.

The business requirements define the functionality.

---

# 5. Reference Fidelity

The supplied reference should NOT be treated as loose inspiration.

The target is:

"Entranced Beauty adapted into this exact design family."

Match the reference closely in:

- overall composition
- spacing
- visual hierarchy
- image proportions
- card dimensions
- card density
- typography scale
- heading scale
- button proportions
- button placement
- section spacing
- bottom navigation proportions
- coral color usage
- white space
- border radius
- image crop style
- service-list density
- booking summary structure
- content rhythm

Do not redesign the UI into your own interpretation.

Do not improve the reference by adding more sections.

Do not fill empty space.

Do not create decorative UI merely because the screen feels empty.

---

# 6. Visual Direction

Target:

```txt
Clean
Soft
Premium
Modern
Feminine
Minimal
Editorial
Beauty-focused
Mobile-first
iOS-influenced
```

Avoid:

```txt
Cute
Childish
Overly pink
Neon
SaaS
Dashboard-like
Tech-startup looking
Over-designed
Generic AI-generated
```

The app should feel calm and intentional.

---

# 7. Color System

The reference's soft coral-pink family should drive the product.

Use approximately:

```css
--coral-primary: #DD7981;
--coral-secondary: #E89096;
--coral-pressed: #C9636C;

--blush-light: #FAEEEE;
--background-soft: #FFF9F8;
--surface: #FFFFFF;

--text-primary: #171717;
--text-secondary: #777271;
--divider-soft: #EFE7E5;
--surface-muted: #F8F4F3;
```

Adjust for contrast if needed.

Do not use the old dark red/coral as the main action color.

Do not introduce:

- purple
- violet
- electric blue
- cyan
- neon pink
- random green
- dark SaaS backgrounds

unless the business genuinely requires a semantic status color.

---

# 8. Glass Usage

The earlier heavy-glass concept is no longer the target.

The UI reference has priority.

Use roughly:

```txt
20–30% translucent / glass materials
70–80% clean opaque surfaces
```

Glass is allowed for:

- bottom navigation
- bottom sheets
- modal overlays
- sticky actions
- floating controls
- calendar overlays
- image overlays

Glass is NOT a card style.

Do not wrap every section in frosted rectangles.

Do not use blue-tinted glass.

Do not use neon glass.

Do not create floating transparent dashboard cards.

---

# 9. Typography

Use a clean system-like sans serif.

Prefer native/system typography.

Do not use multiple decorative fonts.

Do not use script typography for body UI.

The Entranced Beauty logo may use its brand typeface.

Suggested scale:

```txt
Hero: 34–40px
Screen Title: 26–30px
Section Heading: 18–20px
Service Title: 15–17px
Body: 14–16px
Metadata: 12–13px
```

Hierarchy must come from:

- size
- weight
- spacing

not random font families.

---

# 10. Spacing System

Use a disciplined 8-point spacing rhythm.

Preferred values:

```txt
4
8
12
16
20
24
32
40
48
```

Avoid arbitrary values everywhere.

Do not create cramped layouts.

Do not create giant empty gaps.

Match the reference's density.

---

# 11. Radius System

Use restrained rounding.

Suggested:

```txt
Small controls: 10–12px
Inputs: 14–16px
Cards: 16–18px
Large sheets: 22–26px
Primary CTA: 14–18px
```

Do not make everything a pill.

Do not use 30–40px radii everywhere.

---

# 12. Shadow System

Use extremely restrained shadows.

Default:

- low opacity
- large blur
- minimal spread
- warm/neutral black

Do not use:

- heavy floating shadows
- neon shadows
- double shadows
- glow effects
- "premium" gold shadows

If a border is enough, use a border.

---

# 13. Images

Beauty photography is a major part of the design.

Use real Entranced Beauty imagery wherever available.

Do not use AI-generated women.

Do not populate production UI with generic stock beauty images.

If placeholders are temporarily necessary, clearly isolate them so they can be replaced easily.

Image treatment:

- clean crop
- consistent aspect ratios
- no stretching
- no fake filters
- no AI brush effects
- no decorative gradient masks unless directly justified by the reference

Photography should often carry the visual weight.

---

# 14. Entry / Landing Screen

Match the left phone in the supplied reference.

Structure:

```txt
Full-screen beauty photography
Dark image treatment
Entranced Beauty branding
Large bottom-aligned headline
Short supporting copy
Primary coral CTA
Secondary text action
```

Suggested copy:

```txt
Entranced Beauty

Look good,
feel beautiful.

Book Appointment
Explore Services
```

Do not add:

- feature cards
- review stars
- fake customer counts
- statistics
- decorative sparkles
- onboarding carousel

Keep it minimal.

---

# 15. Home Screen

This is one of the most important corrections.

The home screen must match the reference composition more closely.

Do not place the business name centered inside the top navigation.

Preferred hierarchy:

```txt
Top Controls

Entranced Beauty
Book your next appointment

Search services...

Popular Services

Special Offers

Available This Week

Recent Work

Bottom Navigation
```

The visual position occupied by "Hi, Mahi" in the reference should be used by the Entranced Beauty brand/title.

Do NOT use:

```txt
Hi, [customer]
Welcome Back
```

because customers do not have accounts.

Do not place a giant full-width "Book Appointment" button directly below the title if it destroys the reference hierarchy.

Booking should remain obvious through:

- service Book buttons
- bottom navigation Book action
- promotional CTA
- available-date section

---

# 16. Header

Follow reference proportions.

Left:

```txt
Menu icon
```

Right:

```txt
WhatsApp / Contact action
```

Do not add a notification bell unless a real notification system exists.

No fake icons.

No dead actions.

---

# 17. Search

Match the reference search field.

Use:

- white surface
- soft radius
- subtle border/shadow
- clear search icon
- restrained coral action

Placeholder:

```txt
Search services...
```

Search should filter real services.

Do not make the search bar oversized.

---

# 18. Popular Services

This section currently needs tighter reference matching.

Cards should be compact and dense.

Target composition:

```txt
Small image/icon
Service name
Category
Price
Small Book button
```

Example:

```txt
French Manicure
Manicure

N$180        Book
```

Cards should not feel like generic horizontal product cards.

Avoid oversized images.

Avoid large internal whitespace.

Aim for three compact cards to feel visually present across the viewport, like the reference.

---

# 19. Special Offers

Match reference structure:

```txt
Special Offers                See all
[ large coral promotional banner ]
```

Banner:

- coral/pink surface
- short promo text
- one strong image
- simple CTA
- correct proportions

Do not hard-code expired specials.

If there is no active promotion:

- hide the section

Do not invent an offer to fill the UI.

---

# 20. Available This Week

This replaces account-based "Upcoming Appointment".

Keep it visually compatible with the reference.

Show a small number of available dates.

Example:

```txt
Tue 24
Wed 25
Fri 27
```

Selecting a date should enter the booking flow.

Do not build fake booking history for anonymous customers.

---

# 21. Recent Work

Use photography-led content.

Do not make every portfolio item a floating card.

Use editorial image composition.

Possible actions:

```txt
View
Book This Look
```

Only if backed by real data.

---

# 22. Bottom Navigation

Use:

```txt
Home
Services
Book
Contact
```

or:

```txt
Home
Services
Portfolio
Book
```

Choose one and keep it consistent.

Do not add:

- Profile
- Appointments
- Staff
- Explore
- Social

if they do not match Entranced Beauty's actual product.

Match the reference in:

- height
- icon size
- label size
- active state
- spacing
- translucency

---

# 23. Services Screen

Match the right phone in the supplied reference closely.

Top:

```txt
Coral header
Back action
Our Services
Short supporting copy
Search field
```

Below:

```txt
White/light rounded content region
Vertical service rows
```

Each service row:

```txt
Image
Service name
Short description
Price
Book button
```

Keep rows compact.

Avoid large cards.

Avoid too much space.

---

# 24. Service Categories

Support:

```txt
All
Manicure
Pedicure
Makeup
Hair
```

Use restrained controls.

Do not create ten large pill buttons.

A subtle segmented control or filter sheet is preferred.

---

# 25. Service Detail

Match the center phone in the supplied reference.

Structure:

```txt
Large hero/service image
↓
Large white sheet
↓
Service name
Price
Information strip
About
Optional add-ons
↓
Book Now
```

Do not remove the visual information strip.

Use real Entranced Beauty information.

For example:

```txt
60 Min        N$180         Inspo
Duration      Starting      Optional
```

or:

```txt
60 Min        Manicure      Photo
Duration      Category      Welcome
```

Do not copy fake reference labels such as:

```txt
Expert Staff
Premium Product
```

unless they are actually true and useful.

---

# 26. Add-ons

Only show add-ons when a service actually has them.

Examples:

```txt
Decor per finger
Lashes
Attachment
```

Add-on UI must stay visually quiet.

Do not turn service booking into an e-commerce cart.

---

# 27. No Staff Selection

Remove staff selection entirely.

Entranced Beauty is not a multi-staff booking marketplace.

Correct flow:

```txt
Service
→ Date
→ Time
→ Details
```

Do not add a "Choose stylist" screen.

---

# 28. Calendar

Calendar quality matters.

Use:

```txt
Choose a date
Month navigation
Available dates
Unavailable dates
Selected date
```

Available dates should be obvious.

Unavailable dates should be muted.

Selected date uses coral.

Do not show fake availability.

Use existing availability API and booking conflict logic.

---

# 29. Time Selection

After selecting a date:

```txt
Available Times
09:00
10:30
12:00
14:00
15:30
```

Use compact rounded controls.

Selected:

```txt
coral background
white text
```

Unavailable slots must not be selectable.

Do not hard-code times in the frontend.

---

# 30. Client Details

No account.

Ask only:

```txt
Your name
Phone number
Anything we should know?
```

Do not ask for:

- email unless genuinely required
- date of birth
- gender
- password
- username
- address
- account creation

Keep the form light.

---

# 31. Inspiration Upload

Optional.

Use copy like:

```txt
Have a reference?
Upload the look you have in mind.
```

Actions:

```txt
Choose Photo
Take Photo
Replace
Remove
```

Preview the selected image.

Do not force upload.

---

# 32. Booking Summary

Match the reference booking summary closely.

Structure:

```txt
Booking Summary

Review your booking details

[service image]
Service
Date
Time
Location

Your Details

Services
Add-ons

Estimated Total
Deposit
Balance
Duration

Confirm Booking
```

Do not add:

- fake cards
- fake payment methods
- tax unless actually used
- fake loyalty points

---

# 33. Booking Success

Use a restrained confirmation state.

Example:

```txt
Booking received

EB-1042

French Manicure
24 September
14:00
N$180

Entranced Beauty will confirm your appointment shortly.

WhatsApp Us
Done
```

Do not force account creation afterward.

---

# 34. Contact

Keep it simple.

Include only real actions:

- WhatsApp
- Phone
- Instagram
- Location text if available
- Business hours

Do not create a fake support center.

---

# 35. Portfolio

Categories:

```txt
Nails
Pedicure
Makeup
Hair
```

Use:

- large image moments
- clean grids
- simple captions
- optional linked service

No:

- likes
- comments
- follower counts
- social feed behavior

---

# 36. Admin

Admin UI does not need to clone the public UI exactly.

But preserve:

- typography
- spacing discipline
- brand colors
- component quality

Admin should remain functional.

Do not create a giant SaaS analytics dashboard.

Core admin:

```txt
Bookings
Calendar
Services
Portfolio
Specials
Business Settings
```

---

# 37. PWA Requirements

Preserve existing PWA manifest.

Complete PWA behavior if incomplete.

Required:

```txt
Web App Manifest
Standalone display
App icons
Apple touch icon
Theme color
Background color
Service worker
Offline public app shell
Installability
```

Do not pretend booking works offline.

Offline-safe:

```txt
Home
Services
Prices
Portfolio
Policies
Contact
```

Internet required:

```txt
Live availability
Booking submission
Image upload
Admin operations
```

If offline during booking:

```txt
You're offline. Connect to the internet to complete your booking.
```

Do not queue anonymous bookings silently.

---

# 38. Booking Logic

Preserve the existing availability and booking architecture.

Never trust only the browser.

On submit:

1. validate service
2. validate date
3. validate selected time
4. calculate duration
5. calculate price
6. check opening hours
7. check blocked periods
8. check conflicting bookings
9. create booking atomically

If slot is no longer available:

```txt
That time was just booked. Please choose another available time.
```

---

# 39. Namibia Defaults

Currency:

```txt
NAD
Display: N$
```

Timezone:

```txt
Africa/Windhoek
```

Phone:

```txt
Default country code: +264
```

Normalize local numbers.

Example:

```txt
081 123 4567
→ +264811234567
```

---

# 40. Mobile-First

This project is primarily a phone experience.

Design first for:

- iPhone
- Android phones
- installed PWA mode

Desktop is secondary.

Do not create desktop-first layouts and shrink them down.

Respect:

- safe areas
- mobile viewport height
- browser toolbar differences
- virtual keyboard
- touch targets

---

# 41. Motion

Motion should feel restrained and expensive.

Use:

- subtle springs
- short fades
- small scale press response
- sheet transitions
- calendar transitions
- image crossfades

Do not animate everything.

Do not use:

- floating cards
- looping movement
- bouncing buttons
- constant parallax
- decorative loading animation

Motion should explain state.

---

# 42. Accessibility

Maintain:

- minimum touch targets
- readable contrast
- real form labels
- focus states
- keyboard support
- reduced motion support where practical
- screen-reader labels

Do not sacrifice accessibility for aesthetics.

---

# 43. Copywriting

Use short, natural copy.

Good:

```txt
Book appointment
Choose a service
Pick a date
Available times
Add inspiration
Anything we should know?
Booking received
Contact us
```

Banned:

```txt
Elevate your beauty journey
Unlock your inner glow
Discover timeless elegance
Beauty reimagined
Your ultimate beauty destination
Seamlessly transform your look
Indulge in premium self-care
```

Do not generate filler marketing copy.

---

# 44. Strict No-AI-Slop UI Rules

Never create:

- purple gradients
- blue-purple gradients
- neon glows
- random blobs
- generic mesh gradients
- glass cards everywhere
- generic SaaS cards
- 3-card feature rows
- giant metric cards
- fake dashboards
- fake charts
- gradient text headings
- excessive pills
- floating sparkle icons
- fake badges
- random decorative circles
- generic stock imagery
- AI beauty imagery
- generic testimonials
- fake reviews
- fake customer counts
- fake "trusted by" logos
- fake notifications
- fake social proof
- unnecessary onboarding
- meaningless sections

If it is not required by the business or the reference, do not add it.

---

# 45. Strict No-AI-Slop Code Rules

Do not:

- rewrite working code unnecessarily
- create duplicate components
- duplicate booking logic
- use `any` as a shortcut
- ignore TypeScript errors
- disable lint rules to hide problems
- leave TODOs in finished work
- create fake APIs
- use setTimeout to fake loading
- swallow exceptions
- hard-code live business data across components
- trust frontend price calculations
- trust frontend availability
- expose secrets
- introduce new state libraries without need
- add dependencies for tiny utility problems
- produce giant 500+ line components
- place business logic inside presentational components
- break existing tests

Prefer small, typed, reusable units.

---

# 46. Component Rules

Before creating a new component:

1. search for an existing component
2. determine whether it can be extended
3. do not duplicate it under a different name

Component naming must describe purpose.

Bad:

```txt
NiceCard
ModernBox
CoolSection
PremiumCard
NewComponent
```

Good:

```txt
ServiceCard
ServiceListItem
BookingSummary
AvailableDateChip
TimeSlotButton
SpecialOfferBanner
PortfolioTile
```

---

# 47. Visual Audit Before Completion

Before declaring a screen complete, compare it side-by-side with the supplied reference.

Check:

- Is the composition actually similar?
- Are card sizes similar?
- Are images similarly dominant?
- Is typography at similar scale?
- Is there too much content?
- Are buttons too large?
- Are radii too round?
- Is coral too dark?
- Is spacing too loose?
- Did generic component-library styling leak through?
- Did you add UI that the reference does not have?
- Did you create cards just to contain content?
- Does the app look AI-generated?

If yes, correct it before moving on.

---

# 48. Home Screen Audit

The home screen must be checked especially carefully.

Do NOT leave it as:

```txt
Centered brand header
Large CTA
Generic horizontal cards
Random custom sections
```

Target:

```txt
Top controls

Entranced Beauty
Book your next appointment

Search

Popular Services

Special Offers

Available This Week

Recent Work

Bottom Navigation
```

This hierarchy should remain close to the reference.

---

# 49. Service Screen Audit

Target:

```txt
Coral header
Our Services
Supporting copy
Search
Rounded light content region
Compact service rows
Book buttons
```

Do not use huge service cards.

---

# 50. Service Detail Audit

Target:

```txt
Large image
White rounded lower sheet
Service + price
3-column info strip
About
Add-ons
Book Now
```

Do not skip the information strip.

Do not invent fake features.

---

# 51. Definition of Done

A UI task is not complete because:

- the page renders
- the colors are pink
- the buttons work
- the code compiles

It is complete when:

1. business logic still works
2. booking behavior remains correct
3. the visual hierarchy matches the supplied reference
4. there is no generic AI styling
5. mobile behavior is clean
6. accessibility remains acceptable
7. code remains typed and maintainable
8. no fake content has been introduced
9. no unnecessary features were added
10. the screen looks intentionally designed for Entranced Beauty

---

# 52. Implementation Order

Work in this order:

```txt
1. Preserve and verify existing booking logic
2. Establish final design tokens
3. Fix global typography
4. Fix global spacing and radius system
5. Rebuild Home to reference
6. Refine Services to reference
7. Refine Service Detail to reference
8. Refine Date / Time flow
9. Refine Client Details
10. Refine Inspiration Upload
11. Refine Booking Summary
12. Refine Success State
13. Refine Portfolio
14. Refine Contact / Policies
15. Refine Bottom Navigation
16. Complete PWA service worker / installability if missing
17. Review admin consistency
18. Run visual audit
19. Run functional tests
20. Run accessibility and mobile checks
```

Do not start by rebuilding backend code that already works.

---

# 53. Final Standard

The result should feel like the supplied Beauty Hair Salon Booking reference was professionally adapted for Entranced Beauty.

Not:

"AI made a beauty app inspired by Dribbble."

The app must look intentionally designed.

The product must remain simple.

The business must remain recognizable.

The UI must remain close to the reference.

Do not invent.

Do not decorate.

Do not overbuild.

Preserve function.

Match the reference.
