# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Gorgeous Coffee ("LACAPHE") is an Expo / React Native / TypeScript mobile app (also runs on web) that helps coffee farmers diagnose plant diseases: the user photographs a leaf, the image is sent to a backend predictor, and the KTCFS server returns the diagnosis, which the result screen shows with how to re-check the plant and what to do. UI text and many code comments are in Vietnamese.

## Commands

```bash
npm install --legacy-peer-deps        # required: a legacy dependency has an old React peer range
npm run start -- --lan --port 8082    # Metro with cache cleared (start = expo start -c); press w for web
npm run web                           # web only
npm run android / npm run ios         # native builds (need SDK/device; not Expo Go)
npx tsc --noEmit                      # type check (no dedicated script; ~20 pre-existing type errors)
npm run check:tamagui                 # tamagui config/version check
```

- The package manager in practice is **npm** (`package-lock.json`), even though a Yarn release is vendored in `.yarn/` and the `upgrade:tamagui*` scripts use `yarn up`.
- There are no tests. `npm test` points at `jest-expo`, but neither `jest` nor `jest-expo` is installed.
- `biome.json` configures formatting (2 spaces, single quotes, no semicolons, width 90) and linting (`noConsoleLog` is an error), but Biome is not a dependency; run it with `npx @biomejs/biome check .` if needed. Existing files are not consistently formatted (many use double quotes/semicolons), so match the file you are editing.
- Expo SDK is **58** (`expo ~58`, Node ≥22.13, React 19.3, RN 0.88, new architecture enabled); Expo Go on the device must match this SDK. When changing native deps, use `npx expo install <pkg>` to get SDK-aligned versions.

## Architecture

- **Routing: `expo-router` file-based routes under `app/`** (typed routes enabled). `app/_layout.tsx` is the root `Stack` (loads Inter fonts, holds the splash screen, wraps everything in `app/Provider.tsx`). `app/(tabs)/` holds the bottom tabs: `index` (home + weather), `map`, `camera`, `history`, `profile`; `app/(tabs)/_layout.tsx` uses the custom `components/TabBar.jsx`. Stack screens outside tabs: `login`, `result`, `fullText`, `information`, `modal`.
- **Design for farmers and older users**: colors, font sizes and spacing come from `constants/theme.ts` (body text 18, nothing below 16 except tab labels, buttons ≥ 56 px tall, light theme only). Screens are built with plain React Native `StyleSheet` plus the shared pieces in `components/ui.tsx` (`BigButton`, `Card`, `Notice`, `MenuRow`, `SectionTitle`, `ui.body`/`ui.muted`) and Ionicons; keep all UI text in plain Vietnamese. Scan results are colored by status via `statusOf()` in `utils/ktcfs/display.ts` (green healthy, red disease, orange uncertain); `LABEL_COLORS` is only for per-class bars and map markers. On web, a `TextInput` inside a row needs `minWidth: 0` or it pushes siblings out. Cards use the `shadow` token instead of grey borders. The brand is "Lá Cà Phê": `components/Logo.tsx` draws it in SVG (`LogoMark`, with `onDark` / `light` variants for green backgrounds); the app icon, adaptive icon, splash and favicon PNGs in `assets/images/` are rendered from the same shapes. The home tab has no navigation header; it draws its own green header with the logo.
- **UI library: Tamagui** (`tamagui.config.ts`, based on `@tamagui/config/v3`), still wired in through `app/Provider.tsx` but no longer used by the main screens. The Tamagui babel plugin and metro plugin are both configured; the metro plugin generates `tamagui-web.css` (imported by the root layout) — it is a build output, don't hand-edit it. Toasts go through `@tamagui/toast` (`app/CurrentToast.tsx`), though some screens use `react-native-toast-message`.
- **Imports** use the root as `baseUrl`, so `import TabBar from "components/TabBar"` works without relative paths.
- **Backend is the KTCFS mobile API** (`https://ktcfs.nuian.vn/api/v1/mobile`; the API key and test accounts are shared privately, never committed). Every call goes through `utils/ktcfs/api.ts`, which adds `X-API-Key` and `Bearer` headers, on `401 INVALID_TOKEN` calls `/auth/refresh` once (single-flight) and retries, and on a failed refresh clears the session and `router.replace("/login")`. Errors are thrown as `ApiError` with the server's Vietnamese `detail.message` (business errors have `detail.code`; technical errors don't, and get a generic message). Types are in `utils/ktcfs/types.ts`.
- **Auth/session**: `utils/ktcfs/session.ts`. Tokens live in `expo-secure-store` (Keychain/Keystore; AsyncStorage fallback on web); the refresh token rotates on every refresh, so always save the new pair. The user profile is mirrored into AsyncStorage keys `phone`, `user_id`, `username`, `ktcfs_user`; screens check `phone` (or `getUser()`) on mount and redirect to `/login` if missing. Logout calls `/auth/logout` then `clearSession()`.
- **Diagnosis flow**: `app/(tabs)/camera.tsx` watches GPS and only enables the shutter when accuracy < 30 m; photos must come from the in-app camera (no gallery). The back camera is shown in a 3:4 box (`ratio="4:3"`) so the preview matches the photo, with a torch button; pressing the shutter records `captured_at` and the GPS fix, shows "Giữ yên máy" for a moment, then captures. `utils/ktcfs/capture.ts` crops to `LEAF_FRAME` (the same fractions the screen uses to draw the dashed frame) and re-encodes to JPEG ~1600 px long edge, quality 0.8. `components/camera/PhotoPreviewSection.tsx` uses `utils/useScanUpload.ts` to `POST /scans`; it auto-retries only on 503 or network errors, within 30 minutes of capture, and shows 4xx messages to the user. Success pushes `/result?scan_id=…`; `app/result.tsx` loads the scan (in-memory cache, else `GET /scans/{id}`) and must show "Chưa chắc chắn" with both candidates when `result.top2` is not null. `components/scan/ScanImage.tsx` fetches the authed image as a data URI and draws `boxes` scaled from `image_size`.
- **API config**: endpoints come from `constants/api.ts` (`KTCFS_API_URL`, `KTCFS_API_KEY`, `WEATHER_API_KEY`), read from `EXPO_PUBLIC_*` vars in `.env` (gitignored; template in `.env.example`). Restart Metro after editing `.env`. `EXPO_PUBLIC_*` values are inlined into the bundle. The KTCFS server does not allow browser CORS, so on web every KTCFS call fails as a network error; test API flows on Android/iOS.
- **Tab bar**: `components/TabBar.jsx` uses the SDK 58 `tabBar` props (`emitter`, `navigateToTab`), not `navigation`.
- **Web**: `react-native-maps` has no web support, so `app/(tabs)/map.web.tsx` replaces `map.tsx` on web. Any other native-only module needs the same `.web.tsx` treatment, since expo-router loads every tab route up front.
