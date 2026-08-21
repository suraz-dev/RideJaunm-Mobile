# 🏍️ RideJaunm Mobile Client — AI Agent Context & Engineering Standards

> **App Name:** RideJaunm (राइड जाऔं) — *"Let's go. The road knows the way."*  
> **Platform:** React Native (Expo SDK 57+, Strict TypeScript, iOS + Android)  
> **Design & Architecture SSOT:** `/Users/surajshrestha/Documents/Ride Jaum/Ride-jaum-Design`  
> **Execution Status:** Tasks `R0`–`R5` completed and verified. Progressing through `R6`–`R18`.

---

## 🏔️ 1. Product Context & Operational Environment

RideJaunm is an offline-first companion app for motorcycle riders navigating Nepal’s high-altitude and rugged terrain:
- **Routing Personalities**: *Straight* (Fastest/Cyan), *Curvy* (Balanced bends/Volt), and *Supercurvy* (Mountain passes & dirt trails/Magenta).
- **Nepal-Specific Realities**: Monsoon landslide zones, remote fuel station gaps, high-altitude passes (up to 5,416m Thorong La), cellular dead zones in Mustang/Manang/Karnali, and Bikram Sambat (BS) calendar dates.
- **Safety Subsystem**: 88px glove-friendly SOS button with 3-second hold-to-arm, ticking haptics, 10s cancellation window, and multi-hop BLE mesh fallback.

---

## 📐 2. Architecture & Design Rules (Non-Negotiable)

1. **Tokens as Law**:
   - **NEVER use raw hex colors or magic numbers in JSX/styles**.
   - Always import from `src/design/tokens.ts` or use `useTheme().colors`.
   - **SOS Red (`#FF1F3D`) is strictly reserved for emergencies**. Never use it for normal destructive buttons or alerts (use semantic `danger` `#F2603C` instead).

2. **Himalayan-Tactical Tech Theme**:
   - 4 Theme modes must be preserved: `night` (default dark), `dayGlare` (high-contrast sunlight snow), `dusk`, and `blackout`.
   - In `dayGlare` mode, replace transparent glass overlays with solid/near-solid surfaces (`primitive.color.snow[0]`).

3. **Glove-First Touch Sizing**:
   - Minimum standard touch target: **48 dp** (`primitive.size.targetMin`).
   - In-ride touch target: **56 dp** (`primitive.size.targetInRide`).
   - SOS trigger target: **88 dp** (`primitive.size.targetSOS`).

4. **Typography Contract**:
   - **Space Grotesk**: Display headings, telemetry values with `tabular-nums`.
   - **Inter**: General body text, settings, and feed.
   - **Mukta / Noto Sans**: Devanagari (Nepali) place names and text.
   - **JetBrains Mono**: GPS coordinates, mesh node IDs.
   - **Dynamic Type**: All text components must support scaling up to 200% (`maxFontSizeMultiplier={2.0}`) without layout breakage.

5. **Honest Degradation (No False State)**:
   - Always show truthful state: `acquiring`, `locked`, `stale`, or `lost` GPS.
   - For SOS, **never show "Help on the way"** unless confirmed by a real provider or mesh peer receipt. Always show the concrete evidence tier.

---

## 📁 3. Project Structure

```text
RideJaunm-Mobile/
├── App.tsx                        # Root app entry (Fonts loader + ThemeProvider + Navigation)
├── index.ts                       # Expo entry point
├── package.json                   # Dependencies & build scripts
├── tsconfig.json                  # Strict TypeScript configuration
├── AGENTS.md                      # This AI Agent guidelines file
├── EXECUTION_LOG.md               # Task completion logs and verification records
└── src/
    ├── design/
    │   ├── tokens.ts              # Canonical token adapter (colors, typography, radii, spacing)
    │   └── ThemeProvider.tsx      # React Context for theme switching & useTheme() hook
    ├── components/
    │   ├── primitives/            # Text, Badge, Button, SOSButton
    │   └── composites/            # RouteModeSelector, TelemetryHUD
    ├── navigation/
    │   └── TabNavigator.tsx       # 5-tab shell (Ride, Plan, Center SOS, Squad, Garage)
    ├── screens/
    │   ├── RideHomeScreen.tsx     # Map HUD, speed, altitude, route switcher
    │   ├── TripPlannerScreen.tsx  # Route comparison & Nepal hazard checklists
    │   ├── SOSConsoleScreen.tsx   # Emergency SOS console & channel cascade
    │   ├── SquadFeedScreen.tsx    # Live group radar & trail feed
    │   └── ProfileGarageScreen.tsx# Bike garage & live theme switcher
    ├── domain/                    # State machines, offline models (R6+)
    ├── services/                  # MapAdapter, location, BLE mesh, storage (R6+)
    └── test/                      # Jest & React Native Testing Library test suites
```

---

## 🚦 4. Quality Gates & Test Requirements

Before considering any task complete, an AI agent **MUST execute and pass**:

1. **TypeScript Typecheck**:
   ```bash
   npm run typecheck
   # Must exit with 0 errors
   ```

2. **Automated Jest Unit Tests**:
   ```bash
   npm test
   # All test suites must pass
   ```

3. **Accessibility Verification**:
   - Check contrast floors: body ≥ 4.5:1, telemetry ≥ 7:1, SOS ≥ 10:1.
   - Ensure all touch targets have `accessibilityRole` and descriptive `accessibilityLabel`.

---

## 🗺️ 5. Next Tasks in Build Manifest

| Task | Objective | Status |
|---|---|---|
| **R0–R5** | Project setup, Tokens, Atoms, 5-Tab Shell, HUD, SOS Console | ✅ Completed |
| **R6** | Domain models, Encrypted local storage (MMKV/SQLite), Outbox queue | ⏳ Next |
| **R7–R8** | MapAdapter, Vector tile map surface, Custom route polyline layers | ⏳ Pending R6 |
| **R9–R10** | Map Home GPS transitions, Trip Planner waypoint engine | ⏳ Pending R8 |
| **R12** | Offline Region Pack Downloader & Cache Manager | ⏳ Pending R6 |
| **R13–R16**| Live squad tracking, BLE Mesh simulator, Gated SOS services | ⏳ Pending R10 |
