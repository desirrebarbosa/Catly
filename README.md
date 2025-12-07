
# Catly 

> **Version:** 1.02.0
> **Status:** Maintenance / Handover
> **Last Updated:** December 2025

Catly is a comprehensive smart cat management mobile application designed for breeders and pet owners. It tracks cat profiles, health records, lineage (family trees), feeding schedules, adoption history, and inventory supplies.

This repository is a **Monorepo** containing both the backend API and the mobile frontend.

---

## Architecture

### 1. Backend (`/api`)
*   **Runtime:** Node.js
*   **Framework:** Express.js with TypeScript
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Authentication:** JWT (JSON Web Tokens) + 2FA (Speakeasy/TOTP) + Google OAuth
*   **Services:** Resend (Email), Expo Push Notifications

### 2. Frontend (`/mobile`)
*   **Framework:** React Native (via Expo SDK 52)
*   **Language:** TypeScript
*   **Styling:** NativeWind (Tailwind CSS for React Native)
*   **Navigation:** React Navigation (Native Stack + Bottom Tabs)
*   **State Management:** React Context API (`AuthContext`, `CatContext`)

---

## Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn
*   PostgreSQL Database (Local or Cloud like Railway/Supabase)
*   Expo Go app on your physical device (for testing mobile)

### 1. Database Setup
The project uses Prisma. You need a connection string to a PostgreSQL instance.

1.  Navigate to `api/`
2.  Create a `.env` file (see [Environment Variables](#-environment-variables))
3.  Run migrations/push schema:
    ```bash
    cd api
    npm install
    npx prisma generate
    npx prisma db push
    ```

### 2. Backend Setup
```bash
cd api
npm run dev
# Server starts at http://localhost:3000
```

### 3. Mobile Setup
```bash
cd mobile
npm install
npx expo start
# Scan the QR code with Expo Go (Android/iOS)
```

---

## Environment Variables

Create a `.env` file in **`api/`**:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"

# Server
PORT=3000
JWT_SECRET="your_super_secret_key"

# Integrations (Optional for Dev)
GOOGLE_CLIENT_ID="your_google_client_id"
RESEND_API_KEY="re_123456789"
EMAIL_FROM="onboarding@resend.dev"
```

**Note for Mobile:**
The mobile app automatically attempts to connect to `localhost:3000`. If running on a physical device, ensure your phone and computer are on the same Wi-Fi. The logic in `mobile/src/services/api.ts` attempts to resolve your local IP automatically via `expo-constants`.

---

## Database Management & Scripts

The `api/package.json` contains useful scripts for data management.

### Seeding Data (`npm run seed`)
Populates the database with a robust demo dataset, including:
*   **User:** Beatrice Abadiano (`beatrice@catly.com` / `Password123`)
*   **User:** John Doe (`john@catly.com` / `Password123`)
*   **Cats:** Luna, Simba, Nala (linked in a family tree).
*   **Relationships:** Litters, Health Events, Schedules, Contacts.

```bash
cd api
npm run seed
```

### Cleaning Data (`npm run clean`)
**WARNING:** This wipes all data from the database. Useful for resetting before a demo or fresh install.

```bash
cd api
npm run clean
```

### Auto-Archiving Logic
The system includes a "Lazy Archive" mechanism.
*   **Logic:** Cats not updated in 12 months are marked `isArchived: true`.
*   **Trigger:** This runs on server startup (`index.ts`) and every time a user fetches their cat list (`getCats` controller).

---

## Key Features & Modules

### 1. Authentication
*   **Standard:** Email/Password (Bcrypt hashing).
*   **2FA:** TOTP-based 2FA using `speakeasy` and `qrcode`. Users scan a QR code to link Google Authenticator.
*   **Recovery:** Password reset flow via Email (Resend API).

### 2. Core Profile & Lineage
*   **CRUD:** Create, Read, Update, Delete cat profiles.
*   **Family Tree:** Visual representation of lineage. Requires linking `Mother` and `Father` in the cat profile.
*   **Archives:** Cats can be manually or automatically archived.

### 3. Health & Scheduling
*   **Health Log:** Tracks Vaccinations, Surgeries, etc. Supports image attachments (Base64).
*   **PDF Report:** Generates a HTML-based PDF report of health history using `expo-print`.
*   **Schedules:** Recurring tasks (Feeding, Meds). Supports "Select All" cats logic.
*   **Notifications:** Uses `expo-notifications` for local device alerts.

### 4. Inventory & Smart Calc
*   **Inventory:** Tracks supplies.
*   **Smart Calc:** A specific algorithm in `AddInventoryScreen` that calculates food thresholds:
    *   *Formula:* `Total Cat Weight * 0.03 (3% daily intake) * 7 days`.

### 5. Adoption & Contacts
*   **Logic:** When adding an adoption record, if the "Adopter Name" doesn't match an existing contact, a new Contact entity is automatically created in the background.

---

## Testing

### API Integration Tests
Located in `api/src/tests/integration.ts`. This script runs a full CRUD scenario against the running local API.

```bash
cd api
npm run test:diagnose
```

### Mobile Logic Tests
Located in `mobile/src/tests/logic.test.ts`. Verified frontend filtering and sorting logic. Accessed via the hidden **"Diagnostics"** button (or `TestScreen` if enabled in navigation).

---

## Project Structure

```
/
├── api/                        # Backend
│   ├── prisma/                 # Database Schema & Seeds
│   ├── src/
│   │   ├── config/             # DB & Env Config
│   │   ├── controllers/        # Business Logic
│   │   ├── middleware/         # Auth Middleware
│   │   ├── routes/             # Express Routes
│   │   └── services/           # Email/3rd Party
│   └── index.ts                # Entry Point
│
├── mobile/                     # Frontend
│   ├── assets/                 # Images/Icons
│   ├── src/
│   │   ├── components/         # Reusable UI (Buttons, etc.)
│   │   ├── context/            # Global State (Auth, Cats)
│   │   ├── screens/            # App Screens
│   │   ├── services/           # API Client & Notifications
│   │   └── utils/              # Helpers
│   └── App.tsx                 # Main Component & Navigation
│
└── docs/                       # Project Documentation (RTM, UML)
```

## Troubleshooting

1.  **"Network Request Failed" on Mobile:**
    *   Ensure your IP is correctly detected in `mobile/src/services/api.ts`.
    *   Ensure the backend is running (`npm run dev` in `api/`).
    *   Ensure devices are on the same network.

2.  **Database Connection Error:**
    *   Check `DATABASE_URL` in `api/.env`.
    *   Ensure PostgreSQL is running.

3.  **Images not loading:**
    *   The seed data uses Unsplash/Placekitten URLs. Ensure the device has internet access.
