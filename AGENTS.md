# AGENTS.md — Flash Delivery Angola

## Project

- Expo (SDK ~54) + React Native 0.81.5 + React 19.1.0 + TypeScript ~5.9.2
- App name: `Flash-Delivery-Angola`
- New architecture enabled (`newArchEnabled: true` in app.json)
- Single-package app (not a monorepo)

## Developer commands

| Command                | Purpose                          |
| ---------------------- | -------------------------------- |
| `npm start`            | Launch Expo dev server           |
| `npm run android`      | Start on Android emulator/device |
| `npm run ios`          | Start on iOS simulator/device    |
| `npm run web`          | Start in browser (Metro bundler) |
| `npm run typecheck`    | `tsc --noEmit`                   |
| `npm run lint`         | `eslint .`                       |
| `npm run lint:fix`     | `eslint . --fix`                 |
| `npm run format`       | `prettier . --write`             |
| `npm run format:check` | `prettier . --check`             |
| `npm run doctor`       | `expo-doctor` (config health)    |

## CI pipeline (`.github/workflows/ci.yml`)

Run order: `npm ci` → `typecheck` → `lint` → `format:check` → `doctor` (allow fail). No test suite exists.

## Architecture

- **Entry point**: `index.ts` → `App.tsx` → `RootNavigator` (`src/navigation/RootNavigator.tsx`)
- **Routing**: React Navigation native-stack, three-level hierarchy:
    - `RootNavigator` → `SplashScreen` → `OnboardingScreen` → `AuthNavigator` → `MainNavigator`
- **Styling**: NativeWind (Tailwind CSS for RN). Import `'./global.css'` in `App.tsx`. Metro config wired via `withNativeWind()`.
- **Custom theme colors** (tailwind.config.js): `primary` (#FFD700), `secondary` (#231F20), `off-white` (#F4F4F4), `soft-black` (#121212)
- **State management**: Zustand (`src/store/`) for theme; React Query (`@tanstack/react-query`) via `src/lib/queryClient.ts` for server state
- **API layer**: `src/api/` directory exists but is currently empty — use `axios` + `react-query` when adding API code
- **Source tree**: `src/{api,components,constants,hooks,lib,navigation,screens,store,types,utils}`

## Style conventions

- Prettier config: tabs, tabWidth=4, single quotes, trailing commas, semicolons
- ESLint: extends `@react-native`

## Quirks & gotchas

- **`/android` and `/ios` are gitignored**: this is a prebuild / CNG workflow. Run `npx expo prebuild` to regenerate native directories. Do NOT commit native folders.
- **Expo Updates** configured with OTA URL and `appVersion` runtime policy. EAS project ID in `app.json` but no `eas.json` committed yet.
- **No test framework** is configured. If adding tests, use Jest + React Native Testing Library (the `@react-native` ESLint config assumes this convention).
- **`src/api/` is an empty directory**: likely scaffolding for future API modules. Use axios instances, not bare `axios` calls.
- **No `.env` files** committed. Use `.env` + `.env.local` (gitignored) for secrets.
