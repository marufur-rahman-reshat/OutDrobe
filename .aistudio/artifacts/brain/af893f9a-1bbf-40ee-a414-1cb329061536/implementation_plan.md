# OutDrobe — The Pocket Wardrobe: Architecture & Development Plan

A personal digital wardrobe and outfit planning application designed to translate everyday closet friction into an intentional, calm, and structured archive. The application preserves the original visual identity, layout, colors, typography, components, and appearance from the attached project archive while migrating data persistence to Firebase Authentication, Cloud Firestore, Firebase Storage, and a Node.js full-stack runtime.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Firebase Provisioning & Authentication Method**:
> In accordance with your restrictions, Firebase has **not** been provisioned yet. When implementation begins, Firebase will be provisioned using the platform's native setup tool (`show_aistudio_ui` / `set_up_firebase`).
> - **Primary Auth**: Google Sign-In via popup (`signInWithPopup`) and Email/Password authentication.
> - **Guest / Demo Mode**: The original instant demo persona (*Claire Vance*) will be preserved as a zero-friction test capsule so users can immediately test the Outfit Builder without creating credentials.
> - **Confirmation Required**: Please confirm this plan to proceed with Milestone 1 (Foundation & Visual System Setup).

---

### 1. Requirements Analysis & Product Scope

OutDrobe eliminates morning wardrobe decision fatigue through a private, single-tenant visual lookbook that tracks wear frequency and actual cost-per-wear.

#### Core Capabilities
1. **Garment Cataloging**: Add, view, edit, and delete clothing pieces with metadata (category, color, color hex, fabric composition, purchase price, season, styling notes).
2. **Photography & Image Strategy**: Support client-side image compression (HTML5 Canvas to WebP/JPEG under 600KB) and secure Firebase Storage upload, plus high-fidelity preset studio garment silhouettes.
3. **Multi-Dimensional Filtering**: Real-time filtering by Category (*Outerwear*, *Tops*, *Bottoms*, *Footwear*, *Accessories*), Season (*All Seasons*, *Spring*, *Summer*, *Autumn*, *Winter*), and live text search.
4. **Visual Outfit Builder**: Interactive multi-layer silhouette composer (*Outerwear* + *Top* + *Bottom* + *Footwear* + *Accessory*) with live color harmony swatches, capsule shuffling, and direct save to Lookbook.
5. **Saved Outfits & Favorites**: Dedicated Lookbook view with occasion tags (*Daily Studio*, *Professional*, *Campus*, *Evening*, *Weekend*, *Travel*), one-click favorite toggling, and quick wear logging.
6. **Outfit Calendar**: Monthly visual planning grid to assign saved looks to upcoming dates with event notes.
7. **Wear History Diary**: Chronological wear diary with weather context and comfort notes; logging a wear atomically increments the wear count on both the outfit and every constituent garment.
8. **Rule-Based Suggestions**: Algorithmic rotation stylist that identifies under-rotated closet pieces, computes tonal harmony, and adapts to climate temperature bands (*Cool*, *Mild*, *Warm*).
9. **Wardrobe Statistics & Economics**: Quantitative portfolio metrics including total closet investment, utilization percentage, average cost-per-wear, category distribution bars, and color palette frequency.
10. **System Blueprint**: In-app architectural specification and documentation view for engineering transparency.

---

### 2. User Experience & Visual Design Preservation

The original OutDrobe aesthetic is a **quiet, minimalist luxury editorial fashion publication**. Every layout decision honors space, restraint, and intentional typography.

#### Visual Tokens & Color Palette
- **Canvas / Background**: `#FAF8F5` (warm ecru parchment)
- **Primary Ink / Text**: `#1C1D1A` (deep charcoal black)
- **Secondary / Muted Text**: `#5C5E58` and `#73766E`
- **Sage Accent**: `#526B56` (brand signature green) with hover state `#435947`
- **Surface / Card Background**: `#FFFFFF` with `#FAF8F5` contrast wells
- **Subtle Borders**: `#E5E0D8` (structural dividers) and `#EFECE6` (interior item separators)
- **Soft Wells / Nav Surface**: `#F2EFE9`

#### Typography Hierarchy
- **Editorial Headings (`.font-editorial`)**: `Cormorant Garamond` (weights: 500, 600, italic) — used for brand wordmarks, page headlines, and modal titles.
- **Body & Controls (`.font-sans`)**: `Plus Jakarta Sans` (weights: 400, 500, 600, 700) — used for primary interface copy, buttons, labels, and form controls.
- **Metrics & Numbers (`.font-mono-tabular`)**: `IBM Plex Mono` (weights: 400, 500) with `tabular-nums` — used for wear counts, currency values, dates, and statistics.

#### Micro-Interactions & Component Behavior
- Cards feature gentle hover lifts (`hover:-translate-y-0.5 transition-transform duration-150 ease-out`).
- Zero generic pill buttons: all interactive triggers use structured rectangular rounded corners (`rounded-lg`, `rounded-xl`) adhering to the original design system.
- Collapsible responsive navigation drawer for mobile viewports (`lg:hidden`).

---

### 3. Application Architecture & Data Flow

OutDrobe follows a three-tier architecture that decouples UI rendering from business logic and database access:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                               │
│  React 19 + TypeScript + Tailwind CSS (Vite SPA)                           │
│  ┌───────────────────────┬───────────────────────────────────────────────┐  │
│  │    Public Shell       │         Authenticated Workspace Shell         │  │
│  │  - LandingPage        │  - Sidebar Nav        - Header Breadcrumbs    │  │
│  │  - AuthModal          │  - DashboardView      - WardrobeView          │  │
│  │  - BlueprintView      │  - OutfitBuilderView  - OutfitsView           │  │
│  │                       │  - CalendarView       - WearHistoryView       │  │
│  │                       │  - SuggestionsView    - StatisticsView        │  │
│  └───────────────────────┴───────────────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Calls Typed Service
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION SERVICE LAYER                         │
│  - imageCompression.ts: HTML5 Canvas resize (max 900px, WebP/JPEG <= 600KB) │
│  - wardrobeService.ts: Firestore reactive subscriptions & write batches     │
│  - stylistEngine.ts: Rule-based rotation & tonal harmony algorithm          │
│  - analyticsEngine.ts: Cost-per-wear, utilization %, & category economics   │
└──────────────────────┬───────────────────────────────────────┬──────────────┘
                       │ Direct SDK & Token Auth               │ API Fallback
                       ▼                                       ▼
┌──────────────────────────────────────┐     ┌────────────────────────────────┐
│           FIREBASE CLOUD             │     │      NODE.JS / EXPRESS         │
│  - Firebase Authentication (UID/JWT) │     │  - Server-side fallback routes │
│  - Cloud Firestore (ABAC Rules)      │     │  - Development middleware      │
│  - Firebase Storage (/users/{uid}/)  │     │  - Health endpoints            │
└──────────────────────────────────────┘     └────────────────────────────────┘
```

---

### 4. Firestore Database Schema

To guarantee complete tenant isolation, all private application data is structured under user-scoped subcollections:

```
/users/{userId}
  ├── clothingItems/{itemId}
  ├── outfits/{outfitId}
  ├── calendarPlans/{planId}
  └── wearHistory/{logId}
```

#### Document Definitions

1. **User Profile**: `/users/{userId}`
   ```typescript
   interface UserDocument {
     uid: string;
     email: string;
     displayName: string;
     styleNote: string;
     createdAt: Timestamp;
     updatedAt: Timestamp;
   }
   ```

2. **Clothing Item**: `/users/{userId}/clothingItems/{itemId}`
   ```typescript
   interface ClothingItemDocument {
     id: string;
     userId: string;
     name: string;           // max 100 chars
     brand: string;          // max 80 chars
     category: 'Outerwear' | 'Tops' | 'Bottoms' | 'Footwear' | 'Accessories';
     color: string;          // e.g. "Soft Sage"
     colorHex: string;       // e.g. "#7A8F7C"
     fabric: string;         // e.g. "55% Linen, 45% Wool"
     season: 'All Seasons' | 'Spring' | 'Summer' | 'Autumn' | 'Winter';
     purchasePrice: number;  // >= 0
     imageKey: string;       // studio asset key or "custom"
     imageUrl?: string;      // Firebase Storage download URL
     storagePath?: string;   // "users/{uid}/clothing/{itemId}.webp"
     wearCount: number;      // >= 0
     lastWornDate: string | null; // "YYYY-MM-DD"
     isFavorite: boolean;
     notes?: string;         // max 500 chars
     createdAt: Timestamp;
     updatedAt: Timestamp;
   }
   ```

3. **Outfit**: `/users/{userId}/outfits/{outfitId}`
   ```typescript
   interface OutfitDocument {
     id: string;
     userId: string;
     name: string;           // max 100 chars
     occasion: 'Daily Studio' | 'Professional' | 'Campus' | 'Evening' | 'Weekend' | 'Travel';
     season: 'All Seasons' | 'Spring' | 'Summer' | 'Autumn' | 'Winter';
     itemIds: string[];      // max 10 garment references
     isFavorite: boolean;
     wearCount: number;      // >= 0
     lastWornDate: string | null; // "YYYY-MM-DD"
     notes: string;          // max 500 chars
     createdAt: Timestamp;
     updatedAt: Timestamp;
   }
   ```

4. **Calendar Plan**: `/users/{userId}/calendarPlans/{planId}`
   ```typescript
   interface CalendarPlanDocument {
     id: string;
     userId: string;
     date: string;           // "YYYY-MM-DD"
     outfitId: string;       // Reference to /users/{uid}/outfits/{outfitId}
     occasionNote: string;   // max 150 chars
     isCompleted: boolean;
     createdAt: Timestamp;
   }
   ```

5. **Wear History Log**: `/users/{userId}/wearHistory/{logId}`
   ```typescript
   interface WearHistoryDocument {
     id: string;
     userId: string;
     date: string;           // "YYYY-MM-DD"
     outfitId: string | null;
     outfitName: string;
     itemIds: string[];
     occasion: string;
     weatherNote: string;    // e.g. "16°C Crisp Overcast"
     notes: string;
     createdAt: Timestamp;
   }
   ```

---

### 5. Authentication Flow

```
┌────────────────┐     1. Submit Email/Password or Google Popup      ┌──────────────────────┐
│  Browser View  │ ────────────────────────────────────────────────> │ Firebase Auth Client │
└────────────────┘                                                   └──────────┬───────────┘
        ▲                                                                       │
        │ 3. onAuthStateChanged provides user.uid & token                      │ 2. Issues JWT
        └───────────────────────────────────────────────────────────────────────┘
```

1. **Sign-In Modal**: Supports Tabbed Sign-In / Create Account, along with the instant **Claire Vance Demo Persona** for zero-friction evaluation.
2. **State Synchronization**: React context (`AuthProvider`) listens to `onAuthStateChanged()`.
3. **Session Persistence**: Firebase handles local token caching automatically.
4. **Onboarding Seed**: New users receive the option to pre-populate their closet with the original 9-piece minimalist capsule so the Outfit Builder and Statistics can be explored immediately.

---

### 6. Image Upload & Storage Strategy

High-resolution smartphone photos (4MB–10MB) will degrade mobile rendering and consume storage quotas if uploaded uncompressed. OutDrobe implements client-side canvas pre-processing:

1. **Client Resizing**: Before upload, `HTML5 Canvas` draws the photo to a maximum dimension of 900px at 85% JPEG/WebP quality, reducing file sizes from ~8MB to ~150KB–300KB without visual loss.
2. **Deterministic Storage Path**: Files are stored at `/users/{userId}/clothing/{itemId}.webp`.
3. **Storage Security Rules**:
   - Enforce authentication: `request.auth.uid == userId`
   - Enforce file size limit: `request.resource.size < 5 * 1024 * 1024` (5MB maximum)
   - Enforce MIME types: `request.resource.contentType.matches('image/(jpeg|png|webp)')`
4. **Clean Deletion**: When a garment is deleted from Firestore, its associated storage object is deleted concurrently to prevent orphaned storage accumulation.

---

### 7. Cloud Firestore Security Rules

Security rules strictly enforce Attribute-Based Access Control (ABAC) and Owner-Only isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default deny catch-all
    match /{document=**} {
      allow read, write: if false;
    }

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }

    // User Profile Document
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId)
                    && request.resource.data.keys().hasAll(['uid', 'email', 'displayName', 'createdAt'])
                    && request.resource.data.uid == userId;
      allow update: if isOwner(userId)
                    && request.resource.data.uid == resource.data.uid;
      allow delete: if false; // Profiles are preserved

      // Garment Subcollection
      match /clothingItems/{itemId} {
        allow read, write: if isOwner(userId) && isValidId(itemId);
      }

      // Outfits Subcollection
      match /outfits/{outfitId} {
        allow read, write: if isOwner(userId) && isValidId(outfitId);
      }

      // Calendar Plans Subcollection
      match /calendarPlans/{planId} {
        allow read, write: if isOwner(userId) && isValidId(planId);
      }

      // Wear History Subcollection
      match /wearHistory/{logId} {
        allow read, write: if isOwner(userId) && isValidId(logId);
      }
    }
  }
}
```

---

### 8. Page & Component Hierarchy

```
App.tsx (Root Workspace Shell & Auth State)
├── LandingPage (Unauthenticated Hero, Feature Highlights, Capsule Preview)
├── AuthModal (Sign In / Register / Demo Persona)
└── Authenticated Layout
    ├── Desktop Sidebar & Mobile Navigation Drawer
    │   ├── Logo Wordmark (Cormorant Garamond)
    │   ├── Primary Nav Links (10 sections with Lucide icons)
    │   └── User Profile Card with Sign Out
    ├── Contextual Workspace Header (Breadcrumbs + Primary Action CTA)
    └── Active View Router
        ├── DashboardView (Key metrics, Today's planned look, Rotation prompt)
        ├── WardrobeView (Clothing cards grid, Category & Season filter, Search bar, Add/Edit modal)
        ├── OutfitBuilderView (Layer selector, 5-piece visual canvas, Color harmony bar, Save form)
        ├── OutfitsView (Saved lookbook cards, Favorite filter, Wear logger, Schedule modal)
        ├── CalendarView (Interactive month grid, Day look inspector, Outfit assigner)
        ├── WearHistoryView (Chronological table, Outfit details, Weather notes)
        ├── SuggestionsView (Rotation optimizer, Climate bands, 1-click Save to Lookbook)
        ├── StatisticsView (Investment sum, Utilization %, Cost-per-wear ranking, Color charts)
        └── BlueprintView (Engineering architecture specification)
```

---

### 9. Preservation of Original UI & Assets

The rebuilt project will exactly match the attached archive:
1. **Asset Migration**: All original photography (`hero_minimalist_wardrobe`, `garment_sage_blazer`, `garment_charcoal_trousers`, `garment_ivory_knit`, `garment_leather_loafers`, `garment_camel_trench`) and custom SVG silhouettes (`poplin_shirt`, `ecru_denim`, `leather_tote`, `moss_tee`) are preserved intact.
2. **Design Tokens**: The exact color swatches (`#7A8F7C` Sage, `#EFECE4` Ivory, `#2C2E2B` Charcoal, `#CBB799` Oat, `#3B2820` Espresso, etc.) and borders are carried over without alteration.
3. **Card Layouts**: Every `ClothingCard` and `OutfitCard` retains its exact aspect ratios (3:4 garment portrait, 4:3 2x2 outfit grid), typography styles, and tabular cost-per-wear displays.

---

### 10. Phased Development Milestones

#### Phase 1: Foundation, Auth & Core Closet (Milestone 1–3)
- **Milestone 1 (Foundation & Visual System)**: Verify Tailwind CSS configuration, Google Fonts imports (`Cormorant Garamond`, `Plus Jakarta Sans`, `IBM Plex Mono`), base design tokens, asset loading, and the public `LandingPage`.
- **Milestone 2 (Authentication & Workspace Shell)**: Configure Firebase Auth / Mock fallback, build `AuthModal`, desktop sidebar, mobile drawer, and profile header.
- **Milestone 3 (Digital Wardrobe & Image Ingestion)**: Implement `ClothingCard`, `GarmentImage` with SVG fallback, Add/Edit Garment modal with client-side canvas compression, and live category/season filters.

#### Phase 2: Outfit Builder, Lookbook & Planning (Milestone 4–6)
- **Milestone 4 (Visual Outfit Builder & Saved Looks)**: Build 5-layer selector, lookbook canvas, capsule shuffle, color harmony bar, and `OutfitsView` gallery with favorite filtering.
- **Milestone 5 (Calendar & Wear History Diary)**: Monthly calendar grid with date selection, outfit assignment modal, wear history logging with atomic wear counter updates on both outfits and garments.
- **Milestone 6 (Suggestions, Statistics & Security Rules)**: Rule-based rotation stylist engine, wardrobe economics leaderboard (cost-per-wear), color palette charts, and `firestore.rules` validation.

---

### 11. Testing & Verification Strategy

| Test Area | Acceptance Criteria |
|---|---|
| **Responsive Layout** | Verify zero horizontal overflow from 375px mobile viewport to 1440px desktop. |
| **Data Isolation** | User A cannot read, query, or mutate User B's garments, outfits, or calendar plans. |
| **Image Compression** | A 6MB image file uploaded via file picker is downscaled to <= 600KB before cloud transfer. |
| **Atomic Counters** | Marking an outfit as worn on the calendar increments `wearCount` by +1 on the outfit and on every included clothing item simultaneously. |
| **Cost-Per-Wear** | Calculation correctly handles $0 purchases and unworn items without `NaN` or division by zero. |
| **Lookbook Builder** | Garment deletion removes the item reference from affected outfits without crashing the UI. |

---

### 12. Deployment Strategy

- **Build Verification**: Run `npm run build` to verify clean Vite compilation without TypeScript errors.
- **Environment Separation**: Client environment variables prefixed with `VITE_`.
- **Full-Stack Execution**: Node.js Express server (`server.ts`) serves the production bundle from `dist/` and hosts server-side API routes on port 3000.
- **Cloud Run / Hosting Readiness**: Standardized container-compatible start command (`npm run start`).
