# Melanin Hairbook

Build a luxury mobile-first hairstylist booking platform called “Melanin Hair”.

IMPORTANT PRODUCT DIRECTION:

This is NOT a salon management system.
This is NOT a multi-stylist marketplace.
This is NOT enterprise beauty software.

This platform is for:
a single independent hairstylist building a premium digital brand.

The experience should feel:

personal

luxury

feminine

modern

social-inspired

creator-focused

emotional

visually immersive

The platform should feel like:
Instagram + Pinterest + premium iOS booking app.

PRIMARY UI/UX REFERENCE:
https://www.behance.net/gallery/241308885/Wroom-Beauty-Services-Booking-App-%28iOS%29-UXUI

Use the Wroom app as strong visual and UX inspiration.

Closely replicate:

layout quality

spacing system

premium mobile feel

rounded card styles

bottom navigation

visual hierarchy

interaction quality

animation direction

booking flow simplicity

luxury UI feel

glassmorphism overlays

soft gradients

modern beauty aesthetic

DO NOT make it feel:

corporate

enterprise-heavy

like SaaS software

cluttered

like a large salon company

The app should feel like:
a premium hairstylist’s digital world.

TECH STACK:

React

TypeScript

TailwindCSS

Framer Motion

Supabase backend

Mobile-first responsive architecture

DESIGN SYSTEM:

STYLE:

dark luxury aesthetic

cream/beige/gold accents

elegant typography

soft gradients

modern iOS-inspired UI

immersive imagery

editorial-style layouts

PRIMARY COLORS:

#0D0D0D

#1A1A1A

#F5E6D3

#D4B896

#FAF7F2

USE:

rounded cards

blurred glassmorphism modals

smooth shadows

elegant transitions

layered UI depth

AVOID:

bright colors

generic dashboard styling

overly corporate layouts

excessive text-heavy sections

IMPORTANT CONTENT DIRECTION:

The platform should heavily use Instagram-inspired content.

Instagram becomes the visual identity source.

The app should support:

Instagram-linked gallery content

hairstyle imagery

reels/video previews

social links

portfolio content

If Instagram API integration becomes difficult:
build a manual admin upload system that behaves similarly to Instagram content management.

MAIN HOME PAGE STRUCTURE:

HERO SECTION

fullscreen image/video hero

hairstyle imagery from Instagram

luxury overlay gradient

large typography

“Book Appointment” CTA

“Explore Styles” CTA

smooth entrance animations

REMOVE:

AI assistant sections

enterprise metrics

fake statistics

success percentages

TRENDING WORLDWIDE STYLES SECTION

Purpose:
show 3 globally trending hairstyles for inspiration.

IMPORTANT:

no pricing

no heavy booking CTA

inspiration-focused

visual-first

This section should feel editorial and modern.

FOUNDER SECTION

This is NOT a team section.

ONLY show:
the founder/stylist.

SECTION TITLE:
“Meet Your Stylist”

Include:

portrait image

short bio

specialties

home-call availability

personal brand feel

The section should build:
trust and emotional connection.

LIVE FROM THE STUDIO

Instagram-style gallery section.

The grid should:

display hairstyle images/videos

open modal popups

blur background when opened

show additional details

avoid page redirects

Use:

masonry grid layouts

modern hover states

smooth modal animations

STYLES SECTION

Rename all salon/service terminology to:
“Styles”

This section should display:

hairstyle cards

hairstyle images

duration

optional pricing

quick details

booking CTA

The section should feel:
visual-first and premium.

BOOKING EXPERIENCE

The booking flow should feel:
fast, lightweight, modern, and elegant.

BOOKING FLOW:

select hairstyle

choose date

choose time

add optional notes

upload inspiration image

confirm booking

UX STYLE:

modern iOS-style interactions

bottom sheets on mobile

glassmorphism modals

minimal friction

CHAT EXPERIENCE

MOBILE:

fullscreen chat experience

DESKTOP:

floating bottom-right chat widget

DO NOT:
redirect users to a separate chat page unnecessarily.

VIRTUAL TRY-ON

Keep the virtual try-on feature.

But:

keep it lightweight

visually clean

not overly technical

premium enhancement only

ESSENTIALS SECTION

This is NOT a full online shop.

This section should feel like:
“Products I Recommend”

Include:

wigs

extensions

hair products

styling essentials

The stylist can:

recommend products

source products for clients

assist clients with purchases

Keep this lightweight and curated.

MOBILE EXPERIENCE

The platform MUST feel native-mobile-first.

Implement:

floating bottom navigation

swipe-friendly layouts

smooth transitions

layered interactions

fullscreen modals

premium animations

BOTTOM NAVIGATION:

Home

Explore

Book

Favorites

Profile

ANIMATION DIRECTION

Use Framer Motion.

Animations should feel:

soft

elegant

premium

smooth

iOS-inspired

Use:

fade-ins

smooth scaling

subtle hover interactions

layered transitions

Avoid:

excessive motion

flashy effects

gaming-style animations

ADMIN DASHBOARD

Keep admin lightweight.

The admin dashboard should allow:

upload hairstyle images

manage gallery

manage bookings

update pricing

manage reviews

manage essentials/products

manage Instagram-style content

Avoid:
enterprise admin complexity.

USER EXPERIENCE GOAL

The platform should emotionally feel like:

“I found a hairstylist whose work I trust.”

The entire UX should support:

trust-building

visual storytelling

effortless booking

emotional connection

premium beauty branding

The platform should look and feel like:
a high-end modern beauty app designed for iPhone users.

Build this with extremely polished UI quality and strong attention to spacing, animations, mobile interactions, and visual hierarchy.     INSTAGRAM INTEGRATION & CONTENT SOURCE IMPLEMENTATION

The owner’s Instagram account should become the primary visual content source for the platform.

INSTAGRAM ACCOUNT:
https://www.instagram.com/_melanin._.hair_/

IMPORTANT:
The platform should visually feel connected to the owner’s Instagram brand identity at all times.

IMPLEMENT INSTAGRAM-DRIVEN CONTENT ARCHITECTURE

The app should attempt to pull or sync:

profile image

bio

social links

hairstyle images

reels/video previews

highlighted hairstyle content

portfolio imagery

branding visuals

PRIMARY INSTAGRAM CONTENT USAGE

HERO SECTION
Use one of the latest high-quality hairstyle images from Instagram as:

homepage hero background
OR

rotating hero carousel

The hero image should dynamically update when new featured content is selected.

LIVE FROM THE STUDIO SECTION

This section should behave like:
an Instagram-connected gallery feed.

Requirements:

display latest hairstyle images/videos

masonry-style responsive grid

image-first layout

hover interactions

smooth animations

WHEN USERS CLICK A POST:

open modal popup

blur background

display larger media preview

optional caption/details

optional booking CTA

DO NOT:
redirect users away from the app.

SOCIAL LINKS

Add Instagram icon in:

navbar

footer

contact sections

When clicked:
open owner’s Instagram profile.

Also support:

WhatsApp link

TikTok link later if added

FOUNDER SECTION

Pull:

founder imagery inspiration

branding tone

styling aesthetic
from Instagram content direction.

This section should visually match:
the Instagram aesthetic.

STYLES SECTION

Use Instagram hairstyle content as:

hairstyle cards

featured looks

trend examples

hairstyle inspiration

Admin should be able to:

convert Instagram-inspired content into bookable styles.

INSTAGRAM DATA IMPLEMENTATION OPTIONS

OPTION A — INSTAGRAM GRAPH API

Attempt Instagram Graph API integration for:

media sync

profile metadata

gallery updates

Potential usage:

recent posts

reels thumbnails

captions

image URLs

OPTION B — ADMIN-CONTROLLED CONTENT SYNC

If API restrictions exist:
create manual content ingestion system.

Admin dashboard should support:

uploading Instagram images manually

tagging styles

adding captions

assigning categories

marking featured content

The manual upload system should still visually behave like:
an Instagram-connected experience.

ADMIN CONTENT MANAGEMENT FEATURES

Admin should be able to:

upload images/videos

reorder gallery items

feature homepage content

select hero images

update style categories

add pricing manually

add captions/descriptions

VISUAL REQUIREMENTS

The Instagram-connected content should feel:

immersive

visual-first

luxury

editorial

highly mobile optimized

Use:

rounded image cards

soft hover animations

layered depth

premium transitions

glassmorphism overlays

elegant typography overlays

INSTAGRAM CONTENT UX GOAL

The user should feel like:
they are browsing a premium hairstylist’s curated Instagram experience,
but with built-in booking functionality.

The platform should emotionally feel like:
Instagram evolved into a luxury hairstylist booking experience.    CRITICAL DEVELOPMENT & UX IMPLEMENTATION REQUIREMENTS

IMPORTANT:
This project should prioritize:
UI polish,
mobile experience,
and emotional UX quality
over feature quantity.

The platform should feel:
intentional,
clean,
premium,
and highly refined.

DO NOT:
rush into building too many features immediately.

FOCUS FIRST ON:

visual quality

interaction quality

smooth booking flow

mobile responsiveness

premium animations

strong emotional branding

COMPONENT ARCHITECTURE

Build the app using:
highly reusable component architecture.

Create reusable:

cards

buttons

modal systems

gallery systems

typography components

booking components

bottom sheets

section wrappers

navigation components

Avoid:
large monolithic page files.

Maintain:
clean scalable structure.

IMAGE HANDLING

This platform is image-heavy.

Optimize all images for:

lazy loading

responsive sizing

fast performance

mobile optimization

Implement:

blurred loading placeholders

smooth image fade-ins

progressive image loading

MEDIA EXPERIENCE

Video and image content should feel:
premium and immersive.

Implement:

autoplay muted previews where appropriate

smooth hover previews

fullscreen modal viewing

swipeable image galleries on mobile

Avoid:
heavy video overload that slows performance.

PERFORMANCE PRIORITY

This platform must feel:
extremely fast and smooth.

Prioritize:

fast initial load

mobile performance

animation optimization

route-based lazy loading

optimized media delivery

The app should feel:
native-like on mobile devices.

RESPONSIVE REQUIREMENTS

The design should NOT simply shrink desktop layouts.

Design mobile-first from the beginning.

Prioritize:

thumb-friendly interactions

large tap areas

smooth scrolling

bottom navigation

vertical content rhythm

The mobile version is the primary experience.

DESKTOP EXPERIENCE

Desktop should feel:
elegant and immersive,
but still mobile-inspired.

Implement:

centered content layouts

floating UI layers

large editorial imagery

modern spacing systems

Do NOT:
turn desktop into enterprise dashboard UI.

TYPOGRAPHY SYSTEM

Typography should feel:
editorial,
luxury,
and fashion-inspired.

Use:

large headlines

elegant spacing

clean body text

strong visual hierarchy

Avoid:
generic SaaS typography systems.

COPYWRITING STYLE

The tone throughout the platform should feel:

soft

feminine

premium

conversational

modern

Avoid:
corporate wording.

Examples:
Use:
“Book Your Session”
instead of:
“Schedule Appointment”

Use:
“Styles”
instead of:
“Services”

Use:
“Meet Your Stylist”
instead of:
“Our Team”

ADMIN UX DIRECTION

The admin dashboard should feel:
simple and creator-friendly.

The stylist should be able to:

upload content quickly

manage bookings easily

update pricing

manage gallery images

manage featured styles

Avoid:
complicated enterprise admin systems.

BOOKING UX REQUIREMENTS

Booking must feel:
fast and emotionally frictionless.

The user should never feel overwhelmed.

Reduce:

unnecessary form fields

excessive steps

complex flows

Prioritize:

visual selection

simple date picking

lightweight confirmation flow

The entire booking experience should feel:
closer to modern iOS apps than traditional booking websites.

ANIMATION SYSTEM

Animation quality is extremely important.

Use:

Framer Motion

smooth page transitions

shared layout animations

modal transitions

soft hover interactions

elegant fades

Animation should feel:
luxury and subtle.

Avoid:

flashy motion

excessive parallax

gaming-style effects

STATE MANAGEMENT

Use clean scalable state management.

Recommended:

Zustand
OR

Context API with hooks

Separate:

booking state

modal state

gallery state

authentication state

favorites state

SUPABASE IMPLEMENTATION

Use Supabase for:

authentication

bookings

image metadata

gallery management

reviews

favorites

admin content management

Prepare the architecture for:
future scalability,
without making the UI feel enterprise-heavy.

FUTURE EXPANSION READINESS

Even though the experience should remain lightweight,
the architecture should still support future expansion such as:

mobile apps

advanced bookings

loyalty systems

subscriptions

AI recommendations

notifications

Build scalable foundations,
while maintaining a minimal luxury frontend experience.

FINAL UX PRIORITY

The single most important goal:

The user should instantly trust the stylist through visuals alone.

The platform should emotionally feel like:
a premium hairstylist’s curated digital world,
not a generic booking website.

Every UI decision should support:

trust

beauty

elegance

simplicity

emotional connection

premium perception    FINAL PRODUCT STRUCTURE & EXPERIENCE LOCK

IMPORTANT:
Do NOT invent unnecessary sections, features, or enterprise experiences outside the direction already provided.

The platform should remain:
minimal,
luxury,
creator-focused,
and visually intentional.

PRIORITIZE:

emotional UX

visual storytelling

premium interactions

mobile experience

effortless booking

DO NOT:

clutter the homepage

add generic SaaS sections

add enterprise metrics

add fake data

create overly complex admin systems

overload the user with information

FINAL HOME PAGE STRUCTURE

The homepage should follow this exact structure order:

FULLSCREEN HERO SECTION

Instagram-derived hero image/video

luxury overlay gradient

large editorial typography

“Book Your Session” CTA

“Explore Styles” CTA

TRENDING WORLDWIDE STYLES

3 trending hairstyle cards only

visual inspiration-focused

no pricing

minimal text

swipeable on mobile

STYLES SECTION

hairstyle categories

hairstyle cards

visual-first layout

pricing optional

modern card UI

quick booking CTA

MEET YOUR STYLIST

founder portrait

short bio

specialties

home-call availability

trust-building section

LIVE FROM THE STUDIO

Instagram-style gallery

masonry layout

modal popups

blurred background interactions

swipeable gallery on mobile

VIRTUAL TRY-ON

lightweight premium section

visually clean

modern interaction design

CURATED ESSENTIALS

recommended products only

not full marketplace UI

premium editorial product cards

FOOTER
Include:

Instagram

WhatsApp

location

booking links

contact information

NAVIGATION STRUCTURE

TOP NAVIGATION:

Home

Explore Styles

Book

Gallery

Contact

MOBILE BOTTOM NAVIGATION:

Home

Explore

Book

Favorites

Profile

CHAT UX

DESKTOP:

floating bottom-right chat widget

MOBILE:

fullscreen chat experience

The chat should feel:
lightweight,
modern,
and personal.

PAGE EXPERIENCE REQUIREMENTS

Every page should feel:

image-first

spacious

smooth

premium

emotionally engaging

Avoid:

text-heavy layouts

cluttered interfaces

overly corporate sections

CARD DESIGN SYSTEM

All cards throughout the app should follow:

rounded corners

layered depth

soft shadows

luxury spacing

immersive imagery

subtle hover animations

MODAL SYSTEM

Use:

blurred background overlays

glassmorphism

soft transitions

smooth scaling animations

Avoid:
hard page redirects wherever possible.

IMAGE EXPERIENCE

Images are the core of the platform.

Prioritize:

large imagery

editorial layouts

immersive visuals

optimized loading

responsive cropping

The platform should emotionally feel:
like a curated beauty portfolio with built-in booking.

BOOKING EXPERIENCE LOCK

Booking should never feel complicated.

The flow should feel:
fast,
smooth,
and emotionally frictionless.

Users should be able to:
discover a hairstyle →
view details →
book quickly →
chat if needed →
confirm effortlessly.

FINAL EMOTIONAL GOAL

The user should instantly feel:

“This stylist’s work looks premium.
I trust her.
I want to book.”

Every UI and UX decision should support:
trust,
beauty,
simplicity,
and emotional connection.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://melaninhair.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e555dea9-e40c-4cea-a7fe-cb94967148e4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
