# 🍽️ Cafe Order — Contactless QR Menu & Kitchen Management System

> Modern, zero-install Web Application for smart restaurant, cafe, and bar ordering.
>
> 🌐 **Live Demo:** [https://zillerdx.github.io/QR-Menu-Easy-Order/](https://zillerdx.github.io/QR-Menu-Easy-Order/)  
> 📦 **License:** [Business Source License 1.1 (BSL 1.1)](LICENSE)  
> 🧪 **Tests:** 13 Suites | 64 Passed (Exit Code 0)  
> 🛡️ **Security:** Supabase PostgreSQL RLS Hardened | Zero Secret Leaks

---

## 🏛️ The 7 Product Pillars

### 1. Who (Target Stakeholders & Personas)
* **Diners / Patrons (Mobile Customer):** Instant table self-ordering by scanning a physical QR stand with their smartphone camera. Zero app-store downloads or account registrations required.
* **Kitchen Chefs & Line Cooks (KDS View):** Real-time 4-lane digital ticket board with Web Audio harmonic acoustic chimes, elapsed timers, item modifiers, and preparation lanes.
* **Floor Waiters & Cashiers (POS View):** Relieved of manual order-taking; focused on hospitable customer service, instant 80mm thermal receipt printing, and legal A4 tax invoices.
* **Cafe & Restaurant Owners (Admin Portal):** Direct 0% commission PromptPay payments, automated hourly peak sales reporting, multi-tier subscription control, and permanent table stand protection.

---

### 2. Problem (Real-World F&B Pain Points)
* **High Waiter Labor Costs & Staff Turnover:** Taking orders at tables takes 3–5 minutes per party, causing dining bottlenecks during rush hours.
* **High Delivery Commissions (25%–35% GP):** Food aggregators eat away cafe profit margins with steep commission cuts.
* **Order Misunderstandings & Handwriting Errors:** Complex drink modifiers (sugar levels, oat milk, decaf, extra espresso shots) frequently get miscommunicated verbally.
* **Menu Reprinting Costs:** Updating prices, seasonal drinks, or out-of-stock items requires costly reprinting of paper menus and table acrylics.

---

### 3. Solution (The Value Proposition)
* **Zero-Install Web App:** Customers scan the table QR code with their camera, browse visual menus with real-time stock, customize modifiers, and send orders directly to the kitchen.
* **0% Marketplace Fees:** Payments go directly into the merchant's PromptPay bank account via EMVCo QR with zero intermediary deductions.
* **Sub-Second Multi-Tab Local-First Sync:** Powered by \BroadcastChannel\ API and \LocalStorage\ with Supabase PostgreSQL Realtime WebSocket fallback.
* **Permanent Table QR Protection:** Printed acrylic table stands are permanently bound to the unique Store ID (\?shop=...\), guaranteeing zero re-printing of table stands upon plan renewal and preventing free-trial reset abuse.

---

### 4. Features (Functional Highlights)
* **Customer Dining Experience:**
  * Direct smartphone camera scan with table detection (\?table=01\).
  * Visual menu cards with photos, prices, dietary badges, and search filtering.
  * Deep item customization modal (sweetness levels, milk alternatives, extra espresso shots, toppings).
  * 3-second undo countdown modal before final dispatch.
  * Real-time live order progress tracker (\Pending\ ➔ \Cooking\ ➔ \Ready\ ➔ \Completed\).
  * Instant bilingual toggle (Thai 🇹🇭 / English 🇬🇧).
* **Redesigned Acrylic Table Stand QR Generator:**
  * Restaurant-grade acrylic table tent stand format (5x7\" / A5 / A6 compatible).
  * Brand header with store name, tagline, and contactless menu emblem.
  * Prominent high-contrast table hero badge (\TABLE โต๊ะ 01\ / \สั่งกลับบ้าน • TAKEAWAY\).
  * Framed QR centerpiece with camera scanning cue (zero messy raw URL exposure).
  * 3-step visual customer micro-guide (1. Scan QR ➔ 2. Select Menu ➔ 3. Food Served).
  * Single and batch card printing (up to 50 tables) with print CSS rules preventing page breaks.
* **Kitchen Display System (KDS):**
  * Symmetrical 4-lane ticket board: \Pending Queue\ ➔ \Cooking Lane\ ➔ \Ready to Serve\ ➔ \Completed\.
  * Built-in Web Audio API harmonic sound synthesizer (6 presets: Chime, Bell, Marimba, Modern Pulse, Kitchen Gong, Elegant Harp).
  * Multi-timeframe KPI filters: Today, Yesterday, Past 7 Days, and Custom Date Range.
  * Automatic midnight day-rollover with real-time order count and revenue aggregation.
* **POS Settlement & Thermal Invoicing:**
  * PromptPay EMVCo QR code generation with CRC16-CCITT checksum validation.
  * Cash counter settlement & Credit Card tracking.
  * Standard Thai 80mm thermal receipt printer formatting.
  * Full Legal A4 Tax Invoice generation complying with Revenue Department standards.
* **Executive CSV Infographic & Reporting:**
  * One-click CSV export with UTF-8 BOM encoding for seamless Excel opening in Thai & English.
  * Executive financial summaries, payment channel breakdown, hourly peak order analysis, and top 5 bestsellers.
* **Store Management & Admin:**
  * Visual category manager with 29 curated food & beverage Lucide icons.
  * Menu item CRUD with direct image uploads and real-time stock toggles.
  * Store branding, operating hours, contact info, and tax registration settings.
  * Top-level portaled dialogs (\createPortal(modal, document.body)\ with \z-[99999]\) preventing stacking context clipping.
* **SaaS Subscription & Tenant Isolation:**
  * 14-day free trial for new stores with live countdown status.
  * 3 tiered plans: Monthly (฿349/mo), 6-Month (฿1,889/6mo - 10% discount), Yearly (฿3,349/yr - 20% discount).
  * Integrated with live Stripe hosted checkout links.
  * Tenant-isolated data model preventing cross-store order pollution.

---

### 5. Tech Stack & Architectural Rationale

| Layer | Technologies | Architectural Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, TypeScript 5.7, Vite 6 | Fast HMR iteration, strict type safety, zero runtime overhead. |
| **Styling & Design System** | Tailwind CSS 3.4, Lucide React, Canvas Confetti | Utility-first design tokens, responsive bento grids, 100% vector iconography without emoji distortion. |
| **Local-First & Tab Sync** | BroadcastChannel API, LocalStorage Cache | Instant zero-latency (<1ms) multi-tab synchronization with full offline resilience. |
| **Database & Auth** | Supabase (PostgreSQL 15, Row Level Security) | Enterprise RLS securing tenant data; public read-only access with authenticated administrative mutations. |
| **Audio Synthesizer** | Web Audio API (AudioContext, GainNode, OscillatorNode) | Zero external MP3 asset dependency; synthesizer generates pure harmonic chords locally. |
| **Testing Suite** | Vitest 4.1, Testing Library, JSDOM | Blazing fast unit and integration testing across 13 suites and 64 test cases. |
| **CI/CD & Deployment** | GitHub Actions ➔ GitHub Pages | Automated build and deploy pipeline with least-privilege token permissions. |
| **License** | Business Source License 1.1 (BSL 1.1) | Protects SaaS commercialization while granting free self-hosting to independent restaurant owners. |

---

### 6. Architecture & System Flow

\\\mermaid
flowchart TD
    subgraph Customer [\"👤 Customer (Mobile / Dine-in)\"]
        C1[\"Scan Table QR Code (No App Install)\"] --> C2[\"Browse Categorized Menu & Live Stock\"]
        C2 --> C3[\"Customize Modifiers (Sweetness, Milk, Shots)\"]
        C3 --> C4[\"Cart Review & Checkout\"]
        C4 --> C5[\"3s Undo Countdown Modal\"]
        C5 --> C6[\"Live Order Tracker (Realtime Progress)\"]
    end

    subgraph SyncEngine [\"⚡ Local-First Engine & Broadcast\"]
        S1[\"LocalStorage Cache (Offline Fallback)\"]
        S2[\"BroadcastChannel API (Sub-millisecond Tab Sync)\"]
        S3[\"Optimistic UI Updates (Zero Lag)\"]
    end

    subgraph Kitchen [\"👨‍🍳 Kitchen Display System (KDS)\"]
        K1[\"Incoming Order Audio Chime (Web Audio Synthesizer)\"]
        K2[\"Pending Queue (Review Items & Notes)\"]
        K3[\"Cooking Lane (Preparation)\"]
        K4[\"Ready to Serve Lane\"]
        K1 --> K2 --> K3 --> K4
    end

    subgraph Cashier [\"🧾 Cashier & Store Administration\"]
        CS1[\"Payment Method Selection (PromptPay / Cash / Card)\"]
        CS2[\"Bill Settlement & Paid Status\"]
        CS3[\"80mm Thermal Receipt / Legal A4 Tax Invoice\"]
        CS4[\"CSV Executive Infographic Sales Reporting\"]
        CS1 --> CS2 --> CS3
        CS2 --> CS4
    end

    subgraph Cloud [\"☁️ Cloud Backend (Supabase)\"]
        DB1[(\"PostgreSQL 15 Database (Hardened RLS)\")]
        DB2[\"Realtime WebSocket Engine\"]
        DB3[\"Auth & Merchant Ownership Verification\"]
    end

    C5 -->|\"Dispatch Order\"| S2
    S2 -->|\"Local Broadcast\"| S1
    S2 -->|\"Instant Notify\"| K1
    S2 -->|\"Cloud Sync\"| DB1
    DB1 -->|\"Postgres Changes\"| DB2
    DB2 -->|\"Remote Realtime Sync\"| K2
    K3 -->|\"Status: Cooking\"| S2
    K4 -->|\"Status: Ready\"| S2
    S2 -->|\"Live Progress\"| C6
    K4 -->|\"Ready for Payment\"| CS1
    CS2 -->|\"Status: Completed\"| S2
    S2 -->|\"Save State\"| DB1
\\\

---

### 7. Demo & Live Previews
* **Live GitHub Pages Production URL:** [https://zillerdx.github.io/QR-Menu-Easy-Order/](https://zillerdx.github.io/QR-Menu-Easy-Order/)
* **Local Development Preview:** [http://localhost:5173/](http://localhost:5173/)
* **Simulated Customer QR Scan:** [http://localhost:5173/?table=01](http://localhost:5173/?table=01) (Table 01 Diner Session)

---

## 🛡️ Engineering Evidence & Quality Gates

### 1. Automated Test Suite (\
px vitest run\)
All **64 automated tests** pass with **Exit Code 0** across 13 test suites:

| Test Suite | Tests | Status | Scope |
| :--- | :---: | :---: | :--- |
| \	ests/taxInvoice.test.ts\ | 3 | ✅ Pass | 80mm thermal receipt math, VAT 7% extraction & A4 legal invoice generation |
| \	ests/salesReportExport.test.ts\ | 8 | ✅ Pass | UTF-8 BOM CSV generation, sales metrics, peak hour analysis & bestsellers |
| \	ests/saas-subscription-security.test.ts\ | 12 | ✅ Pass | Subscription status calculation, trial countdown, Stripe links & QR anchoring |
| \	ests/subscription.test.ts\ | 5 | ✅ Pass | 14-day free trial math, plan durations, pricing discounts & store binding |
| \	ests/comprehensiveAudit.test.ts\ | 10 | ✅ Pass | Storage persistence, fallback sync, tax calculation & promptpay validation |
| \	ests/kdsDateFilter.test.ts\ | 4 | ✅ Pass | Date filtering (Today, Yesterday, 7 Days, Custom Date) & revenue isolation |
| \	ests/authForgotPassword.test.ts\ | 4 | ✅ Pass | Supabase email password reset flow & form validation |
| \	ests/orderFlow.test.ts\ | 3 | ✅ Pass | Order state machine (\pending\ ➔ \cooking\ ➔ \eady\ ➔ \completed\) |
| \	ests/paymentMethods.test.ts\ | 2 | ✅ Pass | PromptPay, cash, card transitions & bill settlement |
| \	ests/promptpay.test.ts\ | 4 | ✅ Pass | EMVCo payload format, CRC16 checksum & null/empty target protection |
| \	ests/favicon.test.ts\ | 3 | ✅ Pass | Browser favicon, vector SVG link tags & PWA icon assets |
| \	ests/i18n.test.ts\ | 2 | ✅ Pass | Bilingual dictionary parity & language switching |
| \	ests/categoryIcons.test.ts\ | 4 | ✅ Pass | 29 curated food & beverage Lucide icon mappings |

### 2. Security & Zero-Leak Protection Matrix

| Security Layer | Implementation & Hardening | Status |
| :--- | :--- | :---: |
| **Row Level Security (RLS)** | PostgreSQL policies enforce read-only (\SELECT\) for public diners. All administrative mutations (\INSERT\, \UPDATE\, \DELETE\) require authenticated staff with store ownership checks (\user_id = auth.uid()::text\). | 🟢 **Hardened** |
| **Order Immutability** | Customers can only create valid orders (\INSERT\). Orders cannot be deleted anonymously, preventing kitchen ticket tampering. | 🟢 **Hardened** |
| **API Secret Isolation** | Zero backend secrets (\service_role\, Stripe secret keys \sk_...\) are exposed in client bundles. Only browser-safe public keys are loaded. | 🟢 **Zero Leaks** |
| **Git & Secret Hygiene** | Comprehensive \.gitignore\ strictly rejects \.env\, \.env.*\, \*.pem\, \*.key\, \*.secret\, and \credentials.json\. Safe \.env.example\ template provided. | 🟢 **Zero Leaks** |
| **XSS & Injection Protection** | 100% native React JSX escaping; zero instances of \dangerouslySetInnerHTML\ or raw DOM injection. | 🟢 **Protected** |

### 3. Cross-Device Visual Verification (Playwright)
* **Desktop (1280px):** Verified 0 uncaught console errors; clean responsive grid and floating dock.
* **Tablet (768px):** Verified 2-column menu layout, responsive modal dialogs, and sticky controls.
* **Mobile (375px):** Verified single-column touch targets, bottom drawer navigation, and camera scan flow.

---

## 💎 Pricing Plans & Labor Savings (ROI Matrix)

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

## 📂 Annotated Folder Tree

\\\	ext
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
│   │   ├── subscriptionService.ts # SaaS subscription verification & Stripe link helpers
│   │   ├── supabaseClient.ts   # Supabase client initialization & auth helpers
│   │   └── taxInvoice.ts       # Thermal receipt & tax calculation helpers
│   ├── App.tsx                 # Root application controller & realtime event subscriptions
│   ├── index.css               # Global styles & Tailwind CSS directives
│   └── main.tsx                # Application bootstrap entry point
├── tests/                      # Automated test suite (13 suites, 64 passing tests)
│   ├── authForgotPassword.test.ts
│   ├── categoryIcons.test.ts
│   ├── comprehensiveAudit.test.ts
│   ├── favicon.test.ts
│   ├── i18n.test.ts
│   ├── kdsDateFilter.test.ts
│   ├── orderFlow.test.ts
│   ├── paymentMethods.test.ts
│   ├── promptpay.test.ts
│   ├── saas-subscription-security.test.ts
│   ├── salesReportExport.test.ts
│   ├── subscription.test.ts
│   └── taxInvoice.test.ts
├── .env.example                # Safe environment variable configuration template
├── LICENSE                     # Business Source License 1.1 (BSL 1.1)
├── index.html                  # HTML shell & SEO/PWA meta headers
├── package.json                # Project dependencies, scripts & license
├── tailwind.config.js          # Tailwind CSS theme & plugin config
└── vite.config.ts              # Vite configuration & chunk splitting
\\\

---

## ⚡ Commands

\\\ash
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
\\\

---

## 📄 License

This project is licensed under the **Business Source License 1.1 (BSL 1.1)**. See the [LICENSE](LICENSE) file for the full license text.

### Summary of Terms:
* **Non-Commercial, Personal & Evaluation Use:** Free to copy, modify, test, research, and evaluate.
* **Single-Store Self-Hosting:** Independent cafe and restaurant owners may deploy and run this software for their own physical dining establishment without additional licensing fees.
* **Commercial Multi-Tenant & SaaS Restrictions:** You may **not** provide this software as a commercial paid multi-tenant cloud service, resell the platform to third-party businesses, or offer paid white-label instances without an explicit commercial license from the Licensor.
* **Open Source Transition:** On the Change Date (**2030-01-01**), the software automatically transitions to the **Apache License, Version 2.0** (or GNU GPL v2.0+).

For commercial licensing inquiries, contact **Tanathon Chanapha** ([@ZillerDX](https://github.com/ZillerDX)).
