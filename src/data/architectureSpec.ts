export interface BlueprintSection {
  number: string;
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  codeSnippet?: {
    caption: string;
    code: string;
  };
}

export const ARCHITECTURE_BLUEPRINT: BlueprintSection[] = [
  {
    number: '01',
    id: 'requirements',
    title: 'Project Requirements Analysis',
    summary:
      'OutDrobe translates everyday closet friction into a calm, structured digital catalog. Because target users include busy students and professionals, every workflow must complete in under three interactions on both desktop and mobile viewports.',
    keyPoints: [
      'Functional Requirements: Authenticated personal accounts, garment photo upload & metadata cataloging, multi-layer visual outfit builder, favorite marking, date-based calendar scheduling, wear history logging with automatic wear-count updates, rule-based outfit suggestions, and cost-per-wear analytics.',
      'Non-Functional Requirements: Sub-200ms UI responsiveness, strict tenant isolation (User A can never view or mutate User B’s closet), mobile-first touch targets (44px minimum), and resilient image compression before cloud upload.',
      'Beginner-Friendly Principle: Unidirectional data flow—each module reads from a single normalized state store and mutates through explicit, typed service functions.',
    ],
  },
  {
    number: '02',
    id: 'architecture',
    title: 'Complete Application Architecture',
    summary:
      'A layered Three-Tier Architecture separates visual presentation (React + Tailwind CSS), business & validation logic (TypeScript service layer + Node.js API runtime), and cloud persistence (Firebase Auth, Cloud Firestore, Firebase Storage).',
    keyPoints: [
      'Presentation Layer (React + TypeScript + Tailwind CSS): Renders stateless reusable UI cards (ClothingCard, OutfitCard) and stateful module views.',
      'Application Service Layer (src/services/): Encapsulates image resizing (HTML5 Canvas to WebP/JPEG <= 600KB), cost-per-wear math, and API/SDK calls so components never contain raw database queries.',
      'Backend & Cloud Persistence Layer: Node.js Express server handles server-side styling suggestions and validation, while Firebase Auth issues verifiable ID tokens (`request.auth.uid`) enforced across Firestore documents and Storage buckets.',
    ],
    codeSnippet: {
      caption: 'High-Level Request & Data Flow',
      code: `[Browser: React + TypeScript UI]
       │
       ├── 1. Sign In / ID Token ──────► [Firebase Authentication]
       │
       ├── 2. Compressed Garment Image ─► [Firebase Storage: /users/{uid}/items/{itemId}.webp]
       │
       ├── 3. Structured Closet Docs ──► [Cloud Firestore: /users/{uid}/clothingItems, outfits...]
       │
       └── 4. Server Stylist & API ────► [Node.js Express Runtime (/api/* with Bearer Token)]`,
    },
  },
  {
    number: '03',
    id: 'folder-structure',
    title: 'Scalable Beginner-Friendly Folder Structure',
    summary:
      'Grouping files by clear responsibility prevents "giant file syndrome" as you grow from basic HTML/CSS into modular React and TypeScript.',
    keyPoints: [
      'src/components/common/ holds pure visual building blocks (buttons, GarmentImage, ClothingCard, OutfitCard) reusable across multiple screens.',
      'src/components/modules/ maps 1-to-1 with OutDrobe’s core product modules so you always know which file controls which screen.',
      'src/types/ centralizes TypeScript interfaces so data shapes stay consistent from database to UI.',
    ],
    codeSnippet: {
      caption: 'Recommended OutDrobe Project Tree',
      code: `outdrobe/
├── server.ts                        # Node.js Express API & server-side stylist logic
├── firestore.rules                  # Strict owner-only Firestore security rules
├── storage.rules                    # Image MIME-type, size (5MB), & UID path rules
└── src/
    ├── types/
    │   └── outdrobe.ts              # Shared TypeScript interfaces (ClothingItem, Outfit...)
    ├── services/
    │   ├── api.ts                   # Typed client data & auth service
    │   └── imageCompression.ts      # Client-side Canvas image resizer before upload
    ├── data/
    │   ├── garmentAssets.ts         # Curated studio assets & color swatches
    │   └── architectureSpec.ts      # Engineering documentation & blueprint
    ├── components/
    │   ├── common/                  # ClothingCard, OutfitCard, GarmentImage
    │   ├── landing/                 # Public minimalist LandingPage
    │   ├── auth/                    # Sign-In / Registration modal
    │   └── modules/                 # Dashboard, Wardrobe, OutfitBuilder, Calendar, Stats...
    ├── App.tsx                      # Root workspace shell & navigation router
    └── main.tsx                     # Application entry point`,
    },
  },
  {
    number: '04',
    id: 'firestore-model',
    title: 'Cloud Firestore Data Model',
    summary:
      'Using user-scoped subcollections (`/users/{uid}/...`) is the cleanest, safest pattern in Firestore. Every query automatically scopes to a single user without requiring complex composite indexes.',
    keyPoints: [
      'users/{uid}: Stores profile metadata (`displayName`, `email`, `styleNote`, `createdAt`).',
      'users/{uid}/clothingItems/{itemId}: Stores `name`, `brand`, `category`, `color`, `colorHex`, `fabric`, `season`, `purchasePrice`, `storagePath`, `imageUrl`, `wearCount`, `lastWornDate`.',
      'users/{uid}/outfits/{outfitId}: Stores `name`, `occasion`, `season`, `itemIds: string[]`, `isFavorite`, `wearCount`, `lastWornDate`, `notes`.',
      'users/{uid}/calendarPlans/{planId}: Stores `date` ("YYYY-MM-DD"), `outfitId`, `occasionNote`, `isCompleted`.',
      'users/{uid}/wearHistory/{logId}: Stores `date`, `outfitId`, `outfitName`, `itemIds: string[]`, `occasion`, `weatherNote`, `notes`.',
    ],
    codeSnippet: {
      caption: 'Firestore Document Example: /users/{uid}/outfits/{outfitId}',
      code: `{
  "id": "outfit_94f2a1",
  "userId": "usr_82k91m",
  "name": "Architectural Studio Uniform",
  "occasion": "Professional",
  "season": "Spring",
  "itemIds": ["item_blazer_01", "item_knit_02", "item_trouser_03", "item_loafer_05"],
  "isFavorite": true,
  "wearCount": 7,
  "lastWornDate": "2026-10-27",
  "notes": "Sage blazer over ivory merino crewneck",
  "createdAt": "2026-09-25T10:00:00Z"
}`,
    },
  },
  {
    number: '05',
    id: 'relationships',
    title: 'Relationships Between Collections',
    summary:
      'Even though Cloud Firestore is a NoSQL document database, OutDrobe maintains clean relational integrity through lightweight ID references and atomic batch writes.',
    keyPoints: [
      'One-to-Many (User → Subcollections): One `users/{uid}` parent owns all child `clothingItems`, `outfits`, `calendarPlans`, and `wearHistory` documents.',
      'Many-to-Many (Outfits ↔ ClothingItems): An `Outfit` stores an array of `itemIds: string[]`. A single blazer ID can appear in 10 different outfits without duplicating its image or metadata!',
      'One-to-Many (Outfit → CalendarPlans): Scheduling an outfit on Oct 29 and Nov 4 creates two lightweight `calendarPlans` documents referencing `outfitId`.',
      'Atomic Batch Update on Wear Logging: When a user logs a wear in `wearHistory`, a Firestore `writeBatch()` creates the log AND increments `wearCount` (+1) on both the `Outfit` and every referenced `ClothingItem` simultaneously.',
    ],
  },
  {
    number: '06',
    id: 'pages-components',
    title: 'Required Pages & Reusable Components',
    summary:
      'Think of pages as "rooms" in your house and reusable components as identical custom furniture placed inside several rooms.',
    keyPoints: [
      'Public & Auth Views: LandingPage (hero + feature storytelling + capsule showcase), AuthModal (Sign In, Create Account, Instant Demo).',
      'Workspace Views: DashboardView, WardrobeView, OutfitBuilderView, OutfitsView, Favorites filter, CalendarView, WearHistoryView, SuggestionsView, StatisticsView.',
      'Core Reusable Components: <GarmentImage /> (lazy loading + fallback silhouette), <ClothingCard /> (photo, unboxed metadata, cost-per-wear), <OutfitCard /> (multi-item collage grid + favorite toggle + schedule action), <EmptyState /> (guided call-to-action when a filter or collection has zero items).',
    ],
  },
  {
    number: '07',
    id: 'auth-storage',
    title: 'Authentication & Image Storage Approach',
    summary:
      'Never store raw base64 megabyte photos directly inside database text fields in production—store binary files in Firebase Storage and save only the secure reference URL and storage path in Firestore.',
    keyPoints: [
      'Authentication Flow: Firebase Auth manages Email/Password and Google Sign-In. On login, `onAuthStateChanged` provides the current `user.uid` and short-lived JWT ID token.',
      'Client Pre-Upload Compression: Before uploading a 6MB smartphone photo, resize it on an HTML5 `<canvas>` to max 1200px height in WebP/JPEG (~180KB). Pages load 15x faster.',
      'Storage Bucket Path Convention: Save files strictly under `/users/{uid}/clothing/{itemId}.webp`. When deleting a garment from Firestore, also call `deleteObject(ref(storage, item.storagePath))` so orphaned images do not waste storage quota.',
    ],
  },
  {
    number: '08',
    id: 'security-risks',
    title: 'Security Risks & Hardening Strategy',
    summary:
      'Client-side UI hiding is never security. Real protection happens in server token verification and declarative Firestore & Storage Security Rules.',
    keyPoints: [
      'Risk 1 — Broken Object Level Authorization (IDOR): A malicious script guesses another user’s path. Mitigation: Lock `/users/{userId}/{document=**}` so `request.auth.uid == userId`.',
      'Risk 2 — Unrestricted File Uploads: Uploading `.html` or `.exe` payloads or 500MB files. Mitigation: Enforce `request.resource.contentType.matches("image/.*")` and `request.resource.size < 5 * 1024 * 1024` in `storage.rules`.',
      'Risk 3 — Schema Tampering & Negative Prices: Writing negative wear counts or huge strings. Mitigation: Validate field types, string lengths (`<= 120` chars), and non-negative numbers in both backend routes and `firestore.rules`.',
      'Risk 4 — Exposed Secrets: Never commit service-account private keys or `.env` files to Git; keep server keys strictly in environment variables.',
    ],
    codeSnippet: {
      caption: 'Production firestore.rules & storage.rules Pattern',
      code: `// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/clothing/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/(jpeg|png|webp)');
    }
  }
}`,
    },
  },
  {
    number: '09',
    id: 'milestones',
    title: 'Step-by-Step Development Milestones',
    summary:
      'Building all 12 modules at once overwhelms beginners. Shipping six vertical slices keeps the app runnable and testable after every single milestone.',
    keyPoints: [
      'Milestone 1 — Foundation & Public Shell: Set up Vite + React + TypeScript + Tailwind palette, typography, and responsive Public Landing Page.',
      'Milestone 2 — Authentication & Protected Workspace: Wire Sign Up, Sign In, Sign Out, and empty authenticated sidebar layout.',
      'Milestone 3 — Digital Wardrobe & Image Upload: Build Add/Edit/Delete garment forms, client image compression, and category/season filtering.',
      'Milestone 4 — Visual Outfit Builder & Favorites: Build multi-slot layer composer (Outerwear, Top, Bottom, Footwear, Accessory) and Outfit gallery.',
      'Milestone 5 — Outfit Calendar & Wear History: Build monthly calendar scheduler and atomic "Log Wear" workflow incrementing wear counters.',
      'Milestone 6 — Smart Suggestions, Wardrobe Statistics & Security Audit: Add rotation-based stylist recommendations, cost-per-wear charts, and security rule tests.',
    ],
  },
  {
    number: '10',
    id: 'testing',
    title: 'How to Test Each Milestone',
    summary:
      'Every milestone has concrete, beginner-verifiable acceptance checks covering happy paths, empty states, responsiveness, and data isolation.',
    keyPoints: [
      'Milestone 1 & 2 Checks: Resize browser from 375px mobile to 1440px desktop; sign up as User A, refresh the page, verify session persists, then sign up as User B in an incognito window and verify User B cannot see User A’s closet.',
      'Milestone 3 & 4 Checks: Upload a clothing photo, edit its price/season, compose a 4-piece outfit in Outfit Builder, toggle Favorite, and delete one garment to verify outfits gracefully update without crashing.',
      'Milestone 5 & 6 Checks: Schedule an outfit onto tomorrow’s calendar cell, click "Log Wear" on today’s outfit, and confirm every included garment’s `wearCount` increases by +1 and Cost-Per-Wear (`purchasePrice / wearCount`) recalculates accurately.',
    ],
  },
];
