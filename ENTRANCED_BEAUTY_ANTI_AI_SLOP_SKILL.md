# SKILL.md
# Entranced Beauty Anti-AI-Slop Design Governance

## Purpose

This file is a permanent design guardrail for the Entranced Beauty project.

Every agent, IDE, coding model, designer, or developer working on this project must read and follow this file before making frontend changes.

This file exists to prevent the interface from slowly drifting into generic AI-generated UI.

The approved visual reference is the supplied Beauty Hair Salon Booking mobile UI.

The goal is not to create "a nice beauty app."

The goal is to create Entranced Beauty inside that specific design language.

---

# 1. Non-Negotiable Principle

Do not invent a new visual language.

When uncertain:

1. inspect the supplied reference
2. inspect the existing Entranced Beauty product logic
3. choose the simplest solution
4. preserve reference fidelity

Never solve uncertainty by adding decoration.

---

# 2. Source of Truth

Priority:

1. Approved UI reference images
2. Entranced Beauty business requirements
3. Existing functional code
4. Existing design tokens
5. This SKILL.md
6. Personal model preferences

A model's default design taste has the lowest priority.

---

# 3. Product Identity

Entranced Beauty is:

```txt
A simple direct beauty booking PWA
for one business
with anonymous client booking
and admin-only authentication.
```

It is not:

```txt
A SaaS product
A marketplace
A salon directory
A social app
A customer account platform
An AI beauty assistant
An e-commerce store
```

UI must reflect this simplicity.

---

# 4. Design Character

Allowed:

```txt
Clean
Soft
Warm
Minimal
Editorial
Beauty-focused
Premium
Calm
Modern
Mobile-first
```

Forbidden:

```txt
Cyber
Neon
Tech-startup
Futuristic
Gamified
Overly cute
Overly luxurious
Overly feminine
Dashboard-heavy
Template-like
AI-generated
```

---

# 5. Anti-AI-Slop Detection

A screen is drifting into AI slop if it contains several of these:

- too many cards
- too many rounded rectangles
- oversized radius everywhere
- purple/pink gradient backgrounds
- gradient headings
- glass cards on every section
- random blurred blobs
- floating circles
- sparkles
- stars used decoratively
- fake data
- fake analytics
- fake reviews
- fake testimonials
- generic "premium" tags
- generic "AI-powered" labels
- fake notification bells
- fake social proof
- excessive icon badges
- too much centered text
- generic 3-column marketing rows
- hero copy that sounds like ad copy
- overuse of pills
- tiny text inside giant cards
- random animations
- large empty decorative space
- repeated card sections with no visual rhythm
- shadcn defaults visible without restyling
- generic Tailwind template spacing
- UI that could belong to any salon

If any of these appear, stop and redesign.

---

# 6. Color Rules

Approved family:

```txt
Coral pink
Soft blush
Warm white
White
Neutral charcoal
Muted warm grey
```

Primary:

```css
#DD7981
```

Supporting:

```css
#E89096
#FAEEEE
#FFF9F8
#FFFFFF
#171717
#777271
#EFE7E5
#F8F4F3
```

Forbidden by default:

```txt
Purple
Violet
Electric blue
Cyan
Lime
Neon pink
Black tech backgrounds
Rainbow gradients
Mesh gradients
```

Semantic colors are allowed for real states only.

---

# 7. Gradient Rules

Default:

```txt
NO GRADIENT
```

A gradient may only be used if:

- it is directly visible in the approved reference
- or it solves a real image legibility problem

Never use:

- purple-to-pink
- blue-to-purple
- rainbow mesh
- neon radial glow
- decorative gradients behind cards

---

# 8. Glass Rules

Glass is a material, not a theme.

Allowed:

- bottom nav
- bottom sheet
- modal
- image overlay
- floating action
- sticky controls

Forbidden:

- every service card
- every home section
- every form field
- every content group

Target:

```txt
20–30% translucent material
70–80% solid surfaces
```

---

# 9. Card Rules

Before creating a card ask:

"Does this content actually need a container?"

If no, use spacing and typography instead.

Cards should not exist only because card UI is easy.

Forbidden:

- card inside card
- card grids for simple text
- card wrappers around headings
- card wrappers around every section
- giant rounded cards for one line of information

---

# 10. Radius Rules

Use:

```txt
10–12px small controls
14–16px inputs
16–18px cards
22–26px large sheets
```

Pills only for:

- compact status
- filter chip
- time/date selection
- tags

Do not turn buttons, cards, tabs, inputs, banners, and navigation into pills simultaneously.

---

# 11. Shadow Rules

Use shadows only when depth is necessary.

Preferred:

- very soft
- low opacity
- large blur

Forbidden:

- dark floating shadow
- multiple layered shadows
- colored shadow
- coral glow
- neon glow

---

# 12. Typography Rules

Use one main UI family.

Prefer:

```txt
system sans-serif
```

Use script type only for the brand/logo if supplied.

Do not:

- use serif + script + sans all together
- use gradient text
- use all caps everywhere
- use ultra-light body text
- shrink metadata too far

Typography should do more work than containers.

---

# 13. Copy Rules

Copy must sound like a real beauty business.

Good:

```txt
Book appointment
Choose a service
Pick a date
Available times
Add inspiration
Anything we should know?
Booking received
```

Bad:

```txt
Elevate your beauty journey
Unlock your glow
Beauty reimagined
Experience premium elegance
Transform your confidence
Discover your best self
```

Never write filler.

---

# 14. Image Rules

Use real Entranced Beauty work.

Never generate synthetic beauty-client imagery for production.

Do not use generic stock women as final assets.

Do not apply:

- fake depth effects
- AI brush textures
- exaggerated blur
- random colored overlays
- fake film grain

unless specifically required.

---

# 15. Home Screen Rule

The home screen must remain structurally close to the approved reference.

Preferred:

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

Do not add new home sections without a real business requirement.

Maximum home sections should remain tightly controlled.

---

# 16. Services Screen Rule

Reference structure:

```txt
Coral header
Title
Supporting copy
Search
White rounded content area
Compact service list
```

Do not redesign as:

- masonry
- marketplace grid
- huge photo cards
- category dashboard
- filter-heavy shop UI

---

# 17. Service Detail Rule

Must preserve:

```txt
Large image
White lower sheet
Service title
Price
3-column info strip
About
Optional add-ons
Book Now
```

The 3-column strip must use real data.

Never copy fake labels.

---

# 18. Booking Rule

Booking must stay short.

Target:

```txt
Service
Date
Time
Details
Inspiration
Review
Success
```

Do not insert:

- account creation
- loyalty upsell
- add-on marketplace
- package wizard
- multiple confirmation screens
- review solicitation before booking

---

# 19. Form Rule

Every field must earn its existence.

Allowed client fields:

```txt
Name
Phone
Notes
Inspiration
```

Add more only when there is a clear operational reason.

---

# 20. Bottom Navigation Rule

Keep to four items maximum.

Preferred:

```txt
Home
Services
Portfolio
Book
```

or:

```txt
Home
Services
Book
Contact
```

No:

- Profile
- Notifications
- Messages
- Staff
- Explore

unless product scope changes.

---

# 21. Icon Rule

Use one icon family.

Current:

```txt
Lucide
```

Do not mix:

- Font Awesome
- Heroicons
- emoji
- Material icons
- random SVG sets

inside the same interface.

---

# 22. Animation Rule

Animation must communicate:

- navigation
- selection
- state change
- hierarchy

Do not animate purely to make the app feel "premium."

Forbidden:

- floating cards
- pulsating icons
- sparkles
- bouncing CTAs
- auto-scrolling content
- constant parallax
- rotating decorations

---

# 23. Empty State Rule

Write plain language.

Good:

```txt
No times left for this date.
Try another day.
```

Bad:

```txt
Oops! Looks like beauty is fully booked today!
```

Do not force personality where clarity is better.

---

# 24. Data Rule

Never invent business data for aesthetics.

No fake:

- specials
- discounts
- reviews
- ratings
- booking counts
- customer counts
- staff
- awards
- locations
- availability

If data is absent, hide the section.

---

# 25. Component-Library Rule

Libraries may be used as implementation primitives.

They must NOT define the final visual identity.

If shadcn or another library is used:

- remove default styling
- adapt spacing
- adapt radius
- adapt typography
- adapt states
- adapt colors

The final UI should not be recognizable as default shadcn.

---

# 26. Code Quality Rule

UI quality includes code quality.

Never:

- duplicate components
- duplicate styles
- copy-paste booking logic
- use any as a shortcut
- suppress TypeScript errors
- create giant components
- bury API calls inside presentation markup
- hard-code business data in five places
- fake async behavior

---

# 27. Change Discipline

Before editing:

1. identify the exact component
2. identify the exact reference region
3. identify current behavior
4. preserve behavior
5. change only what is necessary
6. test the result

Do not rewrite unrelated files.

Do not "clean up" working code during a focused UI task unless necessary.

---

# 28. Reference Comparison Rule

Every important frontend change requires side-by-side checking against the approved reference.

Compare:

- vertical spacing
- horizontal margins
- card width
- image ratio
- heading size
- button height
- bottom nav height
- coral saturation
- radius
- density
- content count

Do not rely on memory.

---

# 29. Drift Test

Ask:

"If the logo disappeared, would this screen still look like the approved reference family?"

If no, fix it.

Ask:

"Could this same screen be pasted into a random salon app without changing anything?"

If yes, it is too generic.

---

# 30. Less-Is-More Rule

When choosing between:

A. adding another card

B. using spacing and typography

Choose B.

When choosing between:

A. adding another section

B. keeping the screen focused

Choose B.

When choosing between:

A. another effect

B. cleaner hierarchy

Choose B.

---

# 31. Mobile Rule

The phone experience is primary.

Never make the interface desktop-first.

Check:

- safe areas
- thumb reach
- touch targets
- keyboard
- viewport height
- browser install mode
- scrolling
- bottom nav overlap

---

# 32. Accessibility Rule

No visual decision may make the app harder to use.

Maintain:

- readable contrast
- visible focus
- 44px-ish touch targets where possible
- form labels
- understandable errors
- reduced motion support
- logical reading order

---

# 33. Performance Rule

Do not create premium-looking UI that loads poorly.

Optimize:

- images
- layout shifts
- web fonts
- client bundle
- animations
- unnecessary rerenders

Use appropriate image sizes.

---

# 34. Business Authenticity Rule

Entranced Beauty must feel like a real local beauty business.

Use:

- real services
- real prices
- real images
- real contact details
- real availability
- real policies

Avoid generic salon marketing language.

---

# 35. No Feature Inflation

Do not add features because competitors have them.

Current product is intentionally simple.

No customer account unless specifically requested later.

No multi-staff.

No internal messaging.

No marketplace.

No loyalty engine.

No AI hairstyle analysis.

No recommendation engine.

No e-commerce cart.

No social feed.

---

# 36. Completion Gate

Before finishing any UI task confirm all:

- [ ] Matches approved reference family
- [ ] No generic AI design patterns
- [ ] No unnecessary new card
- [ ] No unnecessary new section
- [ ] No fake data
- [ ] No fake functionality
- [ ] No heavy gradient
- [ ] No uncontrolled glass
- [ ] No purple/cyan drift
- [ ] Correct coral
- [ ] Correct spacing
- [ ] Correct radius
- [ ] Real business copy
- [ ] Mobile checked
- [ ] Function preserved
- [ ] TypeScript clean
- [ ] No duplicated component
- [ ] Booking logic not weakened
- [ ] Accessibility not degraded

If any item fails, the task is not complete.

---

# 37. Final Rule

Do not try to impress the user with more design.

Impress through restraint.

The approved reference already defines the visual ambition.

Your job is to reproduce that discipline for Entranced Beauty.

Preserve the business.

Preserve the booking flow.

Match the reference.

Remove anything generic.
