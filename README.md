# OutDrobe — The Pocket Wardrobe

<div align="center">

![OutDrobe Banner](src/assets/images/hero_minimalist_wardrobe_1793337999049.jpg)

**An architectural digital wardrobe and outfit-planning application designed for mindful curation, intentional dressing, and cost-per-wear analytics.**

[![Live Demo](https://img.shields.io/badge/demo-out--drobe.vercel.app-526B56?style=for-the-badge&logo=vercel&logoColor=white)](https://out-drobe.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-1C1D1A?style=for-the-badge&logo=github&logoColor=white)](https://github.com/marufur-rahman-reshat/OutDrobe)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20Postgres%20%7C%20Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Live Demo](#2-live-demo)
3. [Key Features](#3-key-features)
4. [Application Modules and Views](#4-application-modules-and-views)
5. [How OutDrobe Works](#5-how-outdrobe-works)
6. [Technology Stack](#6-technology-stack)
7. [System Architecture](#7-system-architecture)
8. [Database Design and Relational Schema](#8-database-design-and-relational-schema)
9. [Authentication and User Profiles](#9-authentication-and-user-profiles)
10. [Image Upload and Private Storage Architecture](#10-image-upload-and-private-storage-architecture)
11. [Security and Row Level Security (RLS)](#11-security-and-row-level-security-rls)
12. [Project Structure](#12-project-structure)
13. [Getting Started and Local Development](#13-getting-started-and-local-development)
14. [Environment Variables](#14-environment-variables)
15. [Deployment](#15-deployment)
16. [Current Implementation Status](#16-current-implementation-status)
17. [Development Approach and AI Assistance](#17-development-approach-and-ai-assistance)
18. [Future Improvements](#18-future-improvements)
19. [Contributing](#19-contributing)
20. [Author and Project Maintainer](#20-author-and-project-maintainer)
21. [Acknowledgements](#21-acknowledgements)

---

## 1. Project Overview

**OutDrobe** is a personal digital wardrobe manager and lookbook studio built with a focus on editorial minimalism, intentional consumption, and privacy-first cloud architecture. 

Modern wardrobes often suffer from decision fatigue, underutilized garments, and a lack of visibility into the true cost of clothing. OutDrobe digitizes your physical closet, tracks cost-per-wear (CPW) in real time, provides an interactive multi-layer outfit composition studio, and offers scheduled outfit planning—all backed by a secure, relational PostgreSQL database and isolated cloud storage.

### Design Philosophy
- **Warm Editorial Aesthetic:** Styled with warm parchment tones (`#FAF8F5`), botanical sage accents (`#526B56`), and serif typography (`Cormorant Garamond` combined with `Plus Jakarta Sans` and `IBM Plex Mono`).
- **Zero-Pill Minimalist UI:** Built with structured rectangular layouts, clear borders, tactile micro-interactions, and tabular data presentation instead of generic badge-heavy design.
- **Privacy by Default:** Every record and image file is strictly isolated by user UUID using PostgreSQL Row Level Security (RLS) and private storage buckets.

---

## 2. Live Demo

The production application is deployed on Vercel:

- **Live URL:** [https://out-drobe.vercel.app/](https://out-drobe.vercel.app/)
- **Repository:** [https://github.com/marufur-rahman-reshat/OutDrobe](https://github.com/marufur-rahman-reshat/OutDrobe)

---

## 3. Key Features

- **Digital Wardrobe Cataloging:** Add garments with category, fabric, color, season, purchase price, and notes. Choose from curated studio silhouette presets or upload device photos.
- **Client-Side Image Optimization:** Automatically resizes and compresses user-uploaded photos via HTML5 Canvas before transmission, reducing storage footprints and bandwidth.
- **Secure Cloud Storage:** Stores binary images inside a private Supabase Storage bucket (`clothing-images`) in folder structures strictly isolated by user ID (`<user-id>/<uuid>.jpg`).
- **On-Demand Signed URLs:** Generates expiring 24-hour signed URLs in batches, ensuring private bucket images render quickly without ever exposing public access.
- **Visual Lookbook & Outfit Builder:** Layer garments across categories (`Outerwear`, `Tops`, `Bottoms`, `Footwear`, `Accessories`), inspect aesthetic and color balance, and catalog outfits.
- **Relational Many-to-Many Linking:** Normalizes outfits into parent `outfits` and relational `outfit_items` junction rows in PostgreSQL.
- **One-Click Wear Logger:** Log outfit wears with weather conditions and occasion notes. Automatically increments wear counts and updates `last_worn_date` on both the outfit and every individual constituent garment.
- **Cost-per-Wear (CPW) Analytics:** Calculates real-time cost-per-wear (`purchasePrice / wearCount`) to highlight wardrobe return on investment and identify underutilized pieces.
- **Calendar Scheduling:** Schedule planned outfits for upcoming dates and track schedule completion.
- **Curated Capsule Suggestions:** Contextual outfit recommendations based on weather climate and occasion tags.
- **Wardrobe Intelligence:** Highlights the least-worn pieces to combat closet fatigue and promote sustainable clothing rotation.

---

## 4. Application Modules and Views

| View / Module | Purpose & Core Capabilities |
|---|---|
| **Dashboard** (`DashboardView`) | High-level closet overview: total garments, active outfits, capsule utilization rate, net archive valuation, today's scheduled outfit, and underutilized piece alerts. |
| **Wardrobe** (`WardrobeView`) | Filterable gallery with category tabs (`Outerwear`, `Tops`, `Bottoms`, `Footwear`, `Accessories`), seasonal filters, cost-per-wear metrics, favorite toggles, and garment modal. |
| **Outfit Builder** (`OutfitBuilderView`) | Lookbook visual composition studio. Select one piece per layer, preview color balance, shuffle random combinations, and save looks. |
| **Outfits Collection** (`OutfitsView`) | Gallery of saved looks featuring 2x2 collage previews, occasion tags, wear counters, calendar scheduling modal, one-click wear logger, and deletion. |
| **Favorites** (`OutfitsView` / `WardrobeView`) | Filtered view isolating starred garments and favorite outfit ensembles. |
| **Calendar Planner** (`CalendarView`) | Monthly calendar view to schedule outfits for specific calendar days, inspect planned looks, and track calendar completions. |
| **Wear History** (`WearHistoryView`) | Chronicled wear diary logging wear dates, weather notes, occasion tags, and thumbnail piece breakdowns. |
| **Suggestions** (`SuggestionsView`) | Context-driven outfit engine pairing garments according to climate (`Mild`, `Warm`, `Cool`, `Crisp`) and occasion (`Daily Studio`, `Professional`, `Evening`, `Weekend`). |
| **Statistics** (`StatisticsView`) | In-depth analytics: total archive expenditure, cost-per-wear breakdown, category allocation, and piece wear distribution. |
| **Architecture Blueprint** (`BlueprintView`) | Built-in interactive architectural specification documenting the schema, component hierarchy, and database relationships. |

---

## 5. How OutDrobe Works

```
[ User Device ]
      │
      ├─ 1. Captures garment photo (JPEG/PNG/WebP)
      ├─ 2. Offscreen Canvas compresses to 900x900px JPEG
      │
      ▼
[ Supabase Storage ] (clothing-images bucket)
      │
      ├─ 3. Uploads binary image to /<user-id>/<uuid>.jpg
      ├─ 4. Returns relative storage path
      │
      ▼
[ Supabase PostgreSQL ] (clothing_items table)
      │
      ├─ 5. Inserts metadata row with image_url = "<user-id>/<uuid>.jpg"
      │
      ▼
[ Workspace Hydration ] (getWorkspace)
      │
      ├─ 6. Queries clothing_items & outfits via PostgREST
      ├─ 7. Generates batch signed URLs (24h TTL) via Storage API
      ├─ 8. Renders UI cards with authenticated image access
```

---

## 6. Technology Stack

### Frontend & Core
- **Framework:** [React 19](https://react.dev/) (Functional components, custom hooks, `useMemo`, `useCallback`)
- **Language:** [TypeScript 5.x](https://www.typescriptlang.org/) (Strict mode, typed interfaces, standard enums)
- **Build Tool:** [Vite 8](https://vitejs.dev/) (Fast ESM bundler, asset hashing, tree-shaking)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with native CSS variables and typography tokens
- **Icons:** [Lucide React](https://lucide.dev/) (Clean vector iconography)
- **Animation:** [Motion](https://motion.dev/) (Subtle micro-interactions and transitions)

### Backend & Cloud Infrastructure
- **BaaS Platform:** [Supabase](https://supabase.com/)
- **Database:** Supabase Managed PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth (Secure JWT session management, email/password)
- **File Storage:** Supabase Storage (Private `clothing-images` bucket with user-folder RLS)
- **Hosting & CI/CD:** [Vercel](https://vercel.com/) (Production CDN, edge routing, automated branch deployments)
- **AI-Assisted Environment:** Google AI Studio Build

---

## 7. System Architecture

OutDrobe employs a modern, client-authoritative architectural pattern where the React client communicates directly with Supabase services using the official `@supabase/supabase-js` SDK.

```
┌─────────────────────────────────────────────────────────────┐
│                       React SPA (Vite)                      │
│                                                             │
│   ┌───────────────┐   ┌─────────────────┐   ┌───────────┐   │
│   │ App.tsx Shell │───│ View Modules    │───│ Common UI │   │
│   └───────┬───────┘   └─────────────────┘   └───────────┘   │
│           │                                                 │
│           ▼                                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │           API & Service Layer (api.ts)              │   │
│   │   - outdrobeApi (CRUD, workspace hydration)         │   │
│   │   - storageService.ts (upload, batch signed URLs)   │   │
│   └───────────────────────┬─────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTPS / JWT
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Cloud                          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Supabase Auth (GoTrue)                              │   │
│   │ - JWT issuance, email/password verification         │   │
│   └───────────────────────┬─────────────────────────────┘   │
│                           │ auth.uid()                      │
│   ┌───────────────────────▼─────────────────────────────┐   │
│   │ PostgreSQL Database (PostgREST)                     │   │
│   │ - Row Level Security (RLS) on all tables            │   │
│   │ - profiles, clothing_items, outfits, outfit_items   │   │
│   │ - calendar_plans, wear_logs                         │   │
│   └───────────────────────┬─────────────────────────────┘   │
│                           │ Folder Isolation Policy         │
│   ┌───────────────────────▼─────────────────────────────┐   │
│   │ Private Storage Bucket (clothing-images)            │   │
│   │ - Objects scoped to /<auth.uid()>/<file-id>.jpg     │   │
│   │ - 24-hour signed URLs for authenticated reads       │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Database Design and Relational Schema

All database tables are created in the `public` PostgreSQL schema with Row Level Security (RLS) enabled.

### 1. `public.profiles`
Stores user profile information linked directly to the Supabase Auth user record.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, References `auth.users(id)` | User unique identifier |
| `email` | `text` | Not Null | User email address |
| `display_name` | `text` | Nullable | Custom user display name |
| `style_note` | `text` | Nullable | Personal style philosophy or capsule goal |
| `created_at` | `timestamptz` | Default `now()` | Account creation timestamp |

### 2. `public.clothing_items`
Stores the catalog of individual physical garments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default `gen_random_uuid()` | Unique garment record ID |
| `user_id` | `uuid` | References `auth.users(id)` | Record owner |
| `name` | `text` | Not Null | Garment name (e.g., "Sage Tailored Blazer") |
| `brand` | `text` | Default `'Personal Archive'` | Brand or designer |
| `category` | `text` | Not Null | `'Outerwear' \| 'Tops' \| 'Bottoms' \| 'Footwear' \| 'Accessories'` |
| `color` | `text` | Default `'Neutral'` | Primary color name |
| `color_hex` | `text` | Default `'#8C8A82'` | Hex color code for swatch rendering |
| `fabric` | `text` | Default `'Natural Fiber'` | Fabric composition (e.g., "100% Linen") |
| `season` | `text` | Default `'All Seasons'` | `'All Seasons' \| 'Spring' \| 'Summer' \| 'Autumn' \| 'Winter'` |
| `purchase_price` | `numeric` | Default `0` | Original retail or acquired price |
| `image_key` | `text` | Default `'sage_blazer'` | Fallback studio lookbook preset identifier |
| `image_url` | `text` | Nullable | Relative Storage object path (`<user-id>/<uuid>.jpg`) |
| `wear_count` | `integer` | Default `0` | Cumulative times this piece has been worn |
| `last_worn_date` | `text` | Nullable | Date string (`YYYY-MM-DD`) when last worn |
| `is_favorite` | `boolean` | Default `false` | Favorite status flag |
| `notes` | `text` | Nullable | Fit notes, tailoring history, or care instructions |
| `created_at` | `timestamptz` | Default `now()` | Record creation timestamp |

### 3. `public.outfits`
Stores assembled looks and styled ensembles.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default `gen_random_uuid()` | Unique outfit ID |
| `user_id` | `uuid` | References `auth.users(id)` | Record owner |
| `name` | `text` | Not Null | Outfit title (e.g., "Architectural Studio Uniform") |
| `occasion` | `text` | Default `'Daily Studio'` | Occasion classification |
| `season` | `text` | Default `'All Seasons'` | Seasonal classification |
| `is_favorite` | `boolean` | Default `false` | Favorite status flag |
| `wear_count` | `integer` | Default `0` | Cumulative times this ensemble has been worn |
| `last_worn_date` | `text` | Nullable | Date string (`YYYY-MM-DD`) when last worn |
| `notes` | `text` | Nullable | Styling notes and layering details |
| `created_at` | `timestamptz` | Default `now()` | Record creation timestamp |

### 4. `public.outfit_items` (Junction Table)
Represents the normalized Many-to-Many relationship linking `outfits` to `clothing_items`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `outfit_id` | `uuid` | Foreign Key → `public.outfits(id)` ON DELETE CASCADE | Associated outfit |
| `clothing_item_id` | `uuid` | Foreign Key → `public.clothing_items(id)` | Associated garment piece |
| `user_id` | `uuid` | References `auth.users(id)` | Owner UUID for direct RLS enforcement |

### 5. `public.calendar_plans`
Stores scheduled outfits assigned to calendar dates.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default `gen_random_uuid()` | Unique plan ID |
| `user_id` | `uuid` | References `auth.users(id)` | Plan owner |
| `date` | `text` | Not Null | Target date (`YYYY-MM-DD`) |
| `outfit_id` | `uuid` | Foreign Key → `public.outfits(id)` | Scheduled outfit ID |
| `occasion_note` | `text` | Nullable | Specific event note (e.g., "Gallery Opening") |
| `is_completed` | `boolean` | Default `false` | Status indicating if the plan was worn |
| `created_at` | `timestamptz` | Default `now()` | Record creation timestamp |

### 6. `public.wear_logs`
Chronicles wear events and diary entries.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default `gen_random_uuid()` | Unique log entry ID |
| `user_id` | `uuid` | References `auth.users(id)` | Log entry owner |
| `date` | `text` | Not Null | Date worn (`YYYY-MM-DD`) |
| `outfit_id` | `uuid` | Nullable, References `public.outfits(id)` | Associated outfit ID |
| `outfit_name` | `text` | Not Null | Snapshot name of the outfit |
| `item_ids` | `text[]` | Default `'{}'` | Array of garment UUIDs included in this wear |
| `occasion` | `text` | Nullable | Occasion tag for the wear |
| `weather_note` | `text` | Nullable | Weather conditions during wear (e.g., "17°C · Mild") |
| `notes` | `text` | Nullable | Personal notes from the day |
| `created_at` | `timestamptz` | Default `now()` | Timestamp entry was logged |

---

## 9. Authentication and User Profiles

- **Authentication Provider:** Supabase Auth using email and password.
- **Session Persistence:** Managed through client-side local storage using secure, encrypted tokens refreshed automatically by the Supabase client.
- **Profile Synchronization:** When a user logs in, `buildUserProfileFromSupabase()` in `src/services/api.ts` retrieves the matching record from `public.profiles` or creates one if it does not yet exist.
- **No Third-Party OAuth / Social Logins:** The application currently relies strictly on email/password authentication. No external OAuth or social login providers are configured.

---

## 10. Image Upload and Private Storage Architecture

OutDrobe implements a privacy-first approach to user imagery:

```
[ Local Image File ]
         │
         ▼
[ HTML5 Canvas Compression ]
- Constrains max dimension to 900x900px
- Encodes as JPEG at 0.84 quality with #FAF8F5 fill
         │
         ▼
[ uploadGarmentImage() in storageService.ts ]
- Extracts user.id directly from active Supabase session
- Generates path: ${user.id}/${crypto.randomUUID()}.jpg
- Uploads binary Blob to private bucket: clothing-images
         │
         ▼
[ Database Persistence ]
- clothing_items.image_url stores ONLY "${user.id}/${uuid}.jpg"
- NEVER stores Base64 data URLs or long expiring URLs in Postgres
         │
         ▼
[ Hydration via getBatchSignedGarmentUrls() ]
- Collects all Storage paths in single batch
- Requests 24-hour signed URLs via Supabase Storage API
- Resolves to <GarmentImage /> component with seamless preset fallback
```

### Automatic File Lifecycle Management
- **Rollback Protection:** If database insertion fails after an image upload, `deleteGarmentImage()` automatically cleans up the newly uploaded file to avoid orphaned storage objects.
- **Photo Replacement:** When updating an existing garment with a new photo, the old storage object is deleted only after the database update succeeds.
- **Garment Deletion:** Deleting a garment removes its database row and deletes its file from the storage bucket.

---

## 11. Security and Row Level Security (RLS)

Every database table in OutDrobe enforces PostgreSQL Row Level Security (RLS):

- **Data Isolation:** Every table features a `user_id` column linked to `auth.users(id)`.
- **Policy Enforcement:**
  - `SELECT`: `USING (auth.uid() = user_id)`
  - `INSERT`: `WITH CHECK (auth.uid() = user_id)`
  - `UPDATE`: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
  - `DELETE`: `USING (auth.uid() = user_id)`
- **Storage Bucket Policies:** The `clothing-images` bucket enforces folder-level access policies restricting reads, writes, and deletions to objects where the path prefix matches `auth.uid()`.
- **Client Security:** No `service_role` key is embedded or accessible in the client codebase. All operations run under the permissions of the authenticated user's JWT.

---

## 12. Project Structure

```
OutDrobe/
├── .env.example                     # Environment variable template
├── index.html                       # HTML entry point with web fonts & meta
├── package.json                     # Project manifest and scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite bundler configuration
│
├── public/                          # Static assets and icons
│   └── favicon.ico
│
└── src/
    ├── App.tsx                      # Root workspace state container & navigation
    ├── main.tsx                     # React application entry point
    ├── index.css                    # Global Tailwind CSS 4 styling tokens
    │
    ├── assets/
    │   └── images/                  # High-resolution lookbook preset photography
    │       ├── garment_sage_blazer_*.jpg
    │       ├── garment_ivory_knit_*.jpg
    │       ├── garment_charcoal_trousers_*.jpg
    │       ├── garment_camel_trench_*.jpg
    │       ├── garment_leather_loafers_*.jpg
    │       └── hero_minimalist_wardrobe_*.jpg
    │
    ├── components/
    │   ├── auth/
    │   │   └── AuthModal.tsx        # Sign In, Create Account & Demo modal
    │   ├── common/
    │   │   ├── ClothingCard.tsx     # Wardrobe item card with cost-per-wear
    │   │   ├── GarmentImage.tsx     # Universal image renderer with preset fallbacks
    │   │   └── OutfitCard.tsx       # 2x2 collage card with wear & schedule actions
    │   ├── landing/
    │   │   └── LandingPage.tsx      # Public editorial showcase & onboarding hero
    │   └── modules/
    │       ├── BlueprintView.tsx    # Live architectural schema spec viewer
    │       ├── CalendarView.tsx     # Scheduled calendar planner & date inspector
    │       ├── DashboardView.tsx    # Closet health KPIs & wear rotation alerts
    │       ├── OutfitBuilderView.tsx# Lookbook studio for layer composition
    │       ├── OutfitsView.tsx      # Saved looks collection & occasion filters
    │       ├── StatisticsView.tsx   # Financial CPW & capsule utilization analytics
    │       ├── SuggestionsView.tsx  # Weather & occasion recommendation engine
    │       ├── WardrobeView.tsx     # Archive catalog & garment cataloging modal
    │       └── WearHistoryView.tsx  # Wear diary & history chronicle
    │
    ├── data/
    │   ├── architectureSpec.ts      # Architectural specifications data
    │   └── garmentAssets.ts         # Lookbook preset definitions & SVG fallbacks
    │
    ├── lib/
    │   └── supabaseClient.ts        # Supabase client initialization & validation
    │
    ├── services/
    │   ├── api.ts                   # OutDrobe API service (Supabase CRUD & queries)
    │   └── storageService.ts        # Supabase Storage helper (uploads, batch signed URLs)
    │
    └── types/
        └── outdrobe.ts              # TypeScript interfaces and domain types
```

---

## 13. Getting Started and Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.x, 20.x, or 22.x recommended)
- [npm](https://www.npmjs.com/) (Version 9.x or higher)
- A [Supabase](https://supabase.com/) project with PostgreSQL, Auth, and Storage enabled.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/marufur-rahman-reshat/OutDrobe.git
   cd OutDrobe
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure your environment variables:**
   Create a `.env` file in the root directory (see [Environment Variables](#14-environment-variables)).

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000/`.

---

## 14. Environment Variables

Create a `.env` file in the project root:

```ini
# Supabase Project Configuration
# Found in your Supabase Dashboard under Project Settings -> API
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"

# Optional alternative variable names recognized by the client
# SUPABASE_URL="https://your-project-id.supabase.co"
# SUPABASE_PUBLISHABLE_KEY="your-anon-publishable-key"
```

> **Security Note:** Never commit your actual `.env` file or publishable keys to version control. Only client-safe public/anon keys should be used with `VITE_` prefixes. Never use a Supabase `service_role` key in frontend applications.

---

## 15. Deployment

### Deploying to Vercel

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/), select **Add New Project** and import `marufur-rahman-reshat/OutDrobe`.
3. Set the Framework Preset to **Vite**.
4. Configure Build and Output settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**.

---

## 16. Current Implementation Status

| Feature / Domain | Status | Notes |
|---|---|---|
| **User Authentication** | **Production Ready** | Supabase Auth email/password signup, login, session persistence, and logout. |
| **User Profile Management** | **Production Ready** | Display name, email, style note stored in `public.profiles`. |
| **Garment CRUD** | **Production Ready** | Full create, read, update, delete in `public.clothing_items`. Verified in runtime testing. |
| **Image Storage & Uploads** | **Production Ready** | Binary JPEG uploads to private `clothing-images` bucket, folder isolation, batch signed URLs (24h). |
| **Outfit Composition & Storage** | **Production Ready** | Normalized `outfits` and `outfit_items` many-to-many relationship in PostgreSQL. |
| **Wear Logging & Counter Updates** | **Production Ready** | Entries stored in `public.wear_logs`. Atomically increments garment & outfit wear counts. |
| **Calendar Scheduling** | **Production Ready** | Outfit date assignment and completion tracking in `public.calendar_plans`. |
| **Cost-per-Wear Analytics** | **Production Ready** | Real-time calculation and visualization in `StatisticsView`. |
| **Outfit Builder Edit Mode** | **Backend Ready / UI in Progress** | `updateOutfit()` API method is implemented; prefill editing UI is planned. |
| **Social / Lookbook Export** | **Planned** | Planned for upcoming releases. |

---

## 17. Development Approach and AI Assistance

OutDrobe was developed using an AI-assisted engineering workflow in **Google AI Studio Build**.

Google AI Studio Build served as an interactive, AI-powered development environment that assisted with code scaffolding, TypeScript type definitions, architectural planning, and rapid prototyping. 

All core architectural decisions—including the database schema normalization, Row Level Security policies, storage bucket isolation, UI styling discipline, and runtime test validation—were directed, reviewed, configured, and verified through hands-on human software engineering.

---

## 18. Future Improvements

- **Interactive Lookbook Editing:** Complete the visual edit mode within `OutfitBuilderView` to modify existing saved outfits and adjust individual layer pieces.
- **Capsule Wardrobe Challenges:** Automated tracking for 10x10 or 333 capsule wardrobe challenges with milestone badges.
- **High-Resolution Lookbook PDF Export:** Generate printable or exportable lookbook sheets for travel packing and seasonal capsules.
- **Packing List Generator:** Automatically generate vacation packing checklists based on scheduled outfits and trip durations.
- **Laundry & Care Reminders:** Track dry-cleaning cycles and delicate fabric maintenance intervals based on wear frequency.

---

## 19. Contributing

Contributions, feedback, and suggestions are welcome!

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request.

---

## 20. Author and Project Maintainer

**Marufur Rahman Reshat**  
Computer Science & Engineering (CSE) Undergraduate Student  
American International University-Bangladesh (AIUB)  

- **GitHub:** [@marufur-rahman-reshat](https://github.com/marufur-rahman-reshat)
- **Project Repository:** [https://github.com/marufur-rahman-reshat/OutDrobe](https://github.com/marufur-rahman-reshat/OutDrobe)

---

## 21. Acknowledgements

- **[Google AI Studio Build](https://aistudio.google.com/):** For providing the AI-assisted development environment that helped accelerate the prototyping and coding workflow.
- **[Supabase](https://supabase.com/):** For their PostgreSQL database platform, Row Level Security, and Storage services.
- **[Lucide](https://lucide.dev/):** For the clean, accessible icon collection.
- **[Google Fonts](https://fonts.google.com/):** For `Cormorant Garamond`, `Plus Jakarta Sans`, and `IBM Plex Mono`.

---

<div align="center">
  <sub>Built with intention and care for modern, mindful wardrobes.</sub>
</div>
