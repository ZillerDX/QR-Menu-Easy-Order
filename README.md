# 🍽️ QR Menu & Easy Order

> Modern, zero-install Web Application for smart restaurant and cafe ordering.
>
> 🌐 **Live Demo:** [https://zillerdx.github.io/QR-Menu-Easy-Order/](https://zillerdx.github.io/QR-Menu-Easy-Order/)

---

## 📌 Project Overview

**Easy Menu & Easy Order** is a responsive, local-first restaurant management and dine-in web application. It connects customer self-ordering with back-of-house kitchen operations in real time without requiring any app downloads or app-store installs.

* **Customer Dine-In & Takeaway:** Browse visual menus, customize orders (sweetness, milk alternatives, extra shots, toppings), and track live cooking status in real time.
* **Redesigned Acrylic Table QR Stands:** Restaurant-grade table stand cards with store branding, table hero badge, 3-step customer micro-guide, and direct smartphone camera scanning (zero messy URL exposure). Supports single & batch printing formatted for 5x7" / A5 / A6 acrylic holders.
* **Flexible Payments:** Integrated Thai QR (PromptPay EMVCo with CRC16 checksum), Cash at counter, and Credit Card options with thermal receipt (80mm) and full legal tax invoice (A4) printing.
* **Kitchen Display System (KDS):** Symmetrical 4-lane ticket board with Web Audio harmonic chime synthesizer, live KPI counters, date filtering (Today, Yesterday, Past 7 Days, Custom Date), and automatic new-day refresh.
* **Menu & Store Admin:** Manage menu items with direct image uploads, customize categories with 29 curated vector icons, toggle live stock availability, and configure store branding.
* **CSV Executive Infographic Report:** One-click export of sales summaries, billing metrics, hourly peak analysis, and top-selling menus formatted for executives.
* **Hardened Database Security (PostgreSQL RLS):** Strict Row Level Security policies where anonymous customers are restricted to `SELECT` and valid order insertions, while all administrative mutations enforce authenticated role with store ownership checks.
* **Staff Authentication:** Secure Supabase Auth with password recovery and top-level portaled dialogs.
* **SaaS Subscription & Anti-Abuse QR Anchoring:** 14-day free trial for new stores, 3 tiered plans (Monthly ฿349/mo, 6-Month ฿1,889/6mo, Yearly ฿3,349/yr) integrated with Stripe hosted checkout. Anchors printed table stands to unique Store IDs, guaranteeing zero re-printing upon renewal and preventing trial-reset abuse.

---

## 🔄 System Flow & Swimlane Architecture

```mermaid
flowchart TD
    subgraph Customer ["👤 Customer (Mobile / Dine-in)"]
        C1["Scan Table QR Code"] --> C2["Browse Categorized Menu & Stock"]
        C2 --> C3["Customize Modifiers (Sweetness, Milk, Shots)"]
        C3 --> C4["Cart Review & Checkout"]
        C4 --> C5["3s Undo Countdown Modal"]
        C5 --> C6["Live Order Tracker (Real-time Status)"]
    end

    subgraph SyncEngine ["⚡ Local-First Engine & Broadcast"]
        S1["Local Storage Cache (Offline Fallback)"]
        S2["BroadcastChannel API (Sub-millisecond Tab Sync)"]
        S3["Optimistic UI Updates (Zero Lag)"]
    end

    subgraph Kitchen ["👨‍🍳 Kitchen Display System (KDS)"]
        K1["Incoming Order Audio Chime (Web Audio Synthesizer)"]
        K2["Pending Queue (Review Items & Notes)"]
        K3["Cooking Lane (Preparation)"]
        K4["Ready to Serve Lane"]
        K1 --> K2 --> K3 --> K4
    end

    subgraph Cashier ["🧾 Cashier & Store Administration"]
        CS1["Payment Method Selection (QR / Cash / Card)"]
        CS2["Bill Settlement & Paid Status"]
        CS3["Thermal Receipt / Tax Invoice Printing"]
        CS4["Sales Analytics & Hourly Peak Reporting"]
        CS1 --> CS2 --> CS3
        CS2 --> CS4
    end

    subgraph Cloud ["☁️ Cloud Backend (Supabase)"]
        DB1[("PostgreSQL 15 Database")]
        DB2["Realtime WebSocket Engine"]
        DB3["Auth & Row Level Security"]
    end

    C5 -->|"Dispatch Order"| S2
    S2 -->|"Local Broadcast"| S1
    S2 -->|"Instant Notify"| K1
    S2 -->|"Cloud Sync"| DB1
    DB1 -->|"Postgres Changes"| DB2
    DB2 -->|"Remote Realtime Sync"| K2
    K3 -->|"Status: Cooking"| S2
    K4 -->|"Status: Ready"| S2
    S2 -->|"Live Progress"| C6
    K4 -->|"Ready for Payment"| CS1
    CS2 -->|"Status: Completed"| S2
    S2 -->|"Save State"| DB1
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 6 |
| **Styling & UI** | Tailwind CSS 3.4, Lucide React icons, Canvas Confetti |
| **Realtime & Sync** | BroadcastChannel API (tab sync), LocalStorage (offline cache), Supabase Realtime |
| **Backend & DB** | Supabase (PostgreSQL 15, Auth, Row-Level Security) |
| **Audio** | Web Audio API (6 customizable harmonic chime presets) |
| **Testing** | Vitest 4.1, Testing Library, JSDOM (13 test suites, 64 passing tests) |
| **CI/CD & Hosting** | GitHub Actions ➔ GitHub Pages |
| **License** | Business Source License 1.1 (BSL 1.1) |

---

## 🚀 Performance & Architectural Highlights

1. **Local-First & Resilient Sync:** Uses `BroadcastChannel` for zero-latency multi-tab event communication and falls back to `LocalStorage` and Supabase Realtime WebSockets.
2. **Eliminated Storage & Polling Churn:** Background fallback polling is throttled to 15s and only runs when tab is visible (`!document.hidden`), checking content hashes before triggering state updates.
3. **Optimized KDS Render Performance:** All order filters and date checks are memoized with `useMemo`, preventing redundant `new Date()` allocations and isolating 30s timers to active tickets only.
4. **Zero-Stuck Number Inputs:** Custom price delta inputs in admin modals gracefully handle empty values on backspace without locking at `0`.
5. **Clean Vector Design System:** 100% vector iconography using Lucide SVGs without Unicode emoji clutter in production interfaces.
6. **Full-Screen Modal Portaling:** All dialogs and popups are rendered directly to `document.body` via `createPortal` with `z-[99999]`, preventing stacking context trapping and backdrop clipping.
7. **Hardened PostgreSQL RLS:** Database tables strictly isolate authenticated merchant modifications from anonymous diner reads.

---

## 📂 Annotated Folder Tree

```text
qr-menu-app/
├── public/                     # Static assets, official favicons & brand logos
│   ├── favicon.ico             # Multi-size legacy browser favicon
│   ├── favicon.svg             # Vector brand favicon for modern browsers
│   └── apple-touch-icon.png    # iOS bookmark icon (180x180)
├── src/
│   ├── assets/                 # Brand assets & default imagery
│   ├── components/             # Modular React UI components
│   │   ├── admin/              # Menu management, category editor, store settings & Subscription modal
│   │   ├── common/             # Shared components (Header, Receipt, RoleSwitcher, Modals)
│   │   ├── customer/           # Customer views (CartDrawer, ItemModal, OrderTracker, MenuCard)
│   │   ├── kitchen/            # KDS dashboard, OrderCard, StockManager, Analytics & Modals
│   │   ├── portal/             # Store portal login & password reset flows
│   │   └── table-qr/           # Printable table QR stand card generator
│   ├── data/                   # Initial mock data & logo constants
│   ├── types/                  # TypeScript interfaces (Order, MenuItem, Category, Config, Subscription)
│   ├── utils/                  # Core services & utilities
│   │   ├── categoryIcons.tsx   # 29 curated food & beverage Lucide icons
│   │   ├── i18n.ts             # Bilingual translations (TH/EN)
│   │   ├── promptpay.ts        # EMVCo PromptPay QR payload generator & CRC16 checksum
│   │   ├── sound.ts            # Web Audio chime synthesizer (6 presets)
│   │   ├── storage.ts          # RealtimeSyncManager (BroadcastChannel + LocalStorage + Licensing)
│   │   ├── supabaseClient.ts   # Supabase client initialization & auth helpers
│   │   └── taxInvoice.ts       # Thermal receipt & tax calculation helpers
│   ├── App.tsx                 # Root application controller & realtime event subscriptions
│   ├── index.css               # Global styles & Tailwind CSS directives
│   └── main.tsx                # Application bootstrap entry point
│   ├── tests/                  # Automated test suite (13 suites, 64 passing tests)
│   │   ├── authForgotPassword.test.ts
│   │   ├── categoryIcons.test.ts
│   │   ├── comprehensiveAudit.test.ts
│   │   ├── favicon.test.ts
│   │   ├── i18n.test.ts
│   │   ├── kdsDateFilter.test.ts
│   │   ├── orderFlow.test.ts
│   │   ├── paymentMethods.test.ts
│   │   ├── promptpay.test.ts
│   │   ├── saas-subscription-security.test.ts
│   │   ├── salesReportExport.test.ts
│   │   ├── subscription.test.ts
│   │   └── taxInvoice.test.ts
│   ├── .env.example            # Safe environment variable configuration template
│   ├── LICENSE                 # Business Source License 1.1 (BSL 1.1)
│   ├── index.html              # HTML shell & SEO/PWA meta headers
│   ├── package.json            # Project dependencies, scripts & license
│   ├── tailwind.config.js      # Tailwind CSS theme & plugin config
│   └── vite.config.ts          # Vite configuration & chunk splitting
```

---

## 💎 Pricing Plans & Labor Savings

| Plan | Price | Effective Monthly Rate | Daily Average | Discount | Key Benefit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Free Trial** | ฿0 (14 Days) | - | ฿0 | 100% Free | Full feature exploration for new stores |
| **Monthly** | ฿349 / month | ฿349 / mo | ~฿11.6 / day | Standard | Maximum flexibility, less than a cup of coffee/day |
| **6 Months** | ฿1,889 / 6 mo | ~฿314 / mo | ~฿10.4 / day | Save 10% | Save ฿205 vs monthly rate |
| **Yearly** | ฿3,349 / year | ~฿279 / mo | ~฿9.1 / day | Save 20% | Best value, save ฿839 vs monthly rate |

### 🚀 Cafe & Restaurant Labor Reduction & ROI
1. **Saves 70% Order-Taking Time:** Customers self-order at tables on their phones, eliminating repetitive waiter back-and-forth trips.
2. **0% Ordering Errors:** Direct customer customization (sugar levels, toppings, allergens, notes) eliminates handwriting and mishearing issues.
3. **Instant Kitchen KDS Sync:** Audio chime and live queue status dispatch orders to the kitchen instantly without printing order chits.
4. **15-25% Higher Basket Size:** Mouth-watering photography and categorized upsells systematically increase average bill totals.
5. **0% Marketplace Commissions:** 100% of payments go directly to store PromptPay accounts without 30% GP deductions.
6. **Permanent Table QR Protection:** Printed acrylic/wooden table stands are permanently bound to the store ID. Renewing keeps existing table stands working seamlessly with zero re-printing.

---

## ⚡ Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Run automated test suite (Vitest)
npm test

# 4. Build production bundle with TypeScript type-checking
npm run build

# 5. Preview production build locally
npm run preview
```

---

## 📄 License

This project is licensed under the **Business Source License 1.1 (BSL 1.1)**. See the [LICENSE](LICENSE) file for the full license text.

### Summary of Terms:
* **Non-Commercial, Personal & Evaluation Use:** Free to copy, modify, test, research, and evaluate.
* **Single-Store Self-Hosting:** Independent cafe and restaurant owners may deploy and run this software for their own physical dining establishment without additional licensing fees.
* **Commercial Multi-Tenant & SaaS Restrictions:** You may **not** provide this software as a commercial paid multi-tenant cloud service, resell the platform to third-party businesses, or offer paid white-label instances without an explicit commercial license from the Licensor.
* **Open Source Transition:** On the Change Date (**2030-01-01**), the software automatically transitions to the **Apache License, Version 2.0** (or GNU GPL v2.0+).

For commercial licensing inquiries, contact **Tanathon Chanapha** ([@ZillerDX](https://github.com/ZillerDX)).


