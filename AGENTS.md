# AGENTS.md

This is an Expo / React Native mobile app ("Organic Việt Nam", an organic produce commerce app). Prioritize mobile-first patterns, performance, and cross-platform (iOS + Android) compatibility.

## Stack (from package.json — do not assume anything else)

- Expo SDK **58** (`expo ~58`), React Native **0.88**, React **19**, TypeScript **6**
- Routing: `expo-router`
- Styling: **NativeWind 4.2.7 + Tailwind CSS 3.4.17** (Tailwind v3, NOT v4). `darkMode: "class"`
- Lists: `@shopify/flash-list` · Images: `expo-image` · Icons: `lucide-react-native`
- Server state: `@tanstack/react-query` · HTTP: `axios` · Client state: `zustand`
- Forms: `react-hook-form` + `zod`
- Storage: `react-native-mmkv` (non-sensitive), `expo-secure-store` (tokens, secrets)
- Animation: `react-native-reanimated` 4 + `react-native-worklets`, `react-native-gesture-handler`
- Class helpers: `clsx` + `tailwind-merge`
- Also installed: `expo-glass-effect`, `expo-symbols`, `@expo/ui`, `expo-linear-gradient`, `react-native-safe-area-context`, `react-native-keyboard-controller`, `expo-camera`, `expo-location`, `expo-notifications`, `expo-calendar`

Use what is already installed. Do not add a second library for something already covered (for example another state manager, form library, icon set, or storage). Before adding any new dependency, check the Expo-recommended modules and ask if unsure.

## Read order

1. This file: how to work in the repo (commands, routing, rules).
2. `DESIGN.md`: the visual design system (brand, typography, spacing, shapes, components).
3. `global.css` and `tailwind.config.js`: the actual implemented color tokens and type scale.

Read `DESIGN.md` before creating or changing ANY UI: screens, components, styles, theme, or tailwind/NativeWind config. Do not write UI from memory or from generic defaults.

If this file and `DESIGN.md` seem to conflict, follow the "Design system rules" section below. If still unclear, ask instead of guessing.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json` (currently 58).
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

The same applies to NativeWind, Reanimated, FlashList, and react-native-mmkv: check their current docs for the installed major version.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint (also available as the `lint` script)
npx tsc --noEmit            # typecheck (there is no `typecheck` script)
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
- Use FlashList (not FlatList/ScrollView) for product lists and any long or dynamic list.
- Use `expo-image` (not RN `Image`) for photography.
- Store tokens and secrets in `expo-secure-store`, never in MMKV.

## Design system rules

`DESIGN.md` is the source for visual design intent. It was written in a web-style vocabulary (CSS, rem, box-shadow), but this app is React Native + NativeWind. Apply the rules below.

### Where color values live (source of truth)

- **Implemented colors live in `global.css`** as RGB-channel CSS variables (`--color-*`), light in `:root`, dark in `.dark:root`. `tailwind.config.js` maps them to Tailwind utilities. These match the hex values in the PROSE sections of `DESIGN.md` (for example primary `#006B35` = `0 107 53`; dark canvas `#121614` = `18 22 20`).
- The YAML frontmatter `colors` / `colors-dark` in `DESIGN.md` is a Material-style map with DIFFERENT hex values (for example primary `#005026`). Do NOT use those hex values and do not mix the two. Ignore the frontmatter colors for implementation.
- Never hard-code hex/rgb colors in components. Use the Tailwind tokens below. If a needed color has no token, add a `--color-*` variable to BOTH `:root` and `.dark:root` in `global.css`, map it in `tailwind.config.js`, using the value from `DESIGN.md` prose, then use the token.
- Exception for props that cannot take a className (for example `lucide-react-native` icon `color`, reanimated styles, shadow colors): do NOT hard-code hex in each component. Read colors from one shared hook (for example `useThemeColors()`, which returns values matching `global.css` for the current scheme). If the hook does not exist yet, create it once, with values copied from `global.css`, and reuse it.
- Not yet tokenized, add only when a component needs it: Luminous Highlight `#00E676` (dark micro-accents, glow, live status), Deep Forest brand `#006B35` in dark (badges, premium tiers; currently only available as `secondary-container` in dark).

### Available color tokens (Tailwind utilities)

Use as `bg-*`, `text-*`, `border-*`, etc. Alpha works (`bg-primary/20`).

- Backgrounds: `canvas` (screen background), `surface` (cards), `surface-soft`, `surface-container-lowest|low|(default)|high|highest`, `surface-variant`
- Text: `ink` (primary text, same as `on-surface`), `muted` (secondary text, same as `on-surface-variant`)
- Borders: `border`, `border-strong`
- Brand: `primary` / `on-primary`, `primary-container` / `on-primary-container`, `secondary` / `on-secondary`, `secondary-container` / `on-secondary-container`, `tertiary` / `on-tertiary`
- Errors: `danger` / `on-danger`, `danger-container` / `on-danger-container` (note: named `danger`, NOT `error`)

Rules:

- Use semantic tokens so light/dark switch automatically. Do NOT write `dark:` color overrides for colors that already have a token.
- Use `text-ink` / `text-muted` for text. Do not use `text-black`, `text-gray-*`, or `text-white` for themed text.
- Do not use default Tailwind palette colors (`green-500`, `gray-200`, ...). They are not part of the design system.

### Themes (light / dark)

- Support three user choices: light, dark, system. **Default is system** (follow device appearance, including live changes while the app is running). Persist the user's choice across launches (MMKV is fine; it is not sensitive).
- Dark mode is class-based (`darkMode: "class"`). Switch themes through NativeWind's color-scheme API; check the NativeWind 4.2 docs for the exact API instead of toggling classes by hand.
- Never mix light and dark tokens on one screen. Dark mode: never use font weights below 400.

### Typography

- Only font: **Be Vietnam Pro** (Regular 400, Medium 500, SemiBold 600, Bold 700), files in `assets/fonts`, loaded in the root Expo Router layout before the app is shown. Do not add other fonts.
- Style text with `font-vietnam` plus ONE `text-*` size token from `tailwind.config.js`: `display-xl`, `display-lg`, `headline-lg`, `headline-lg-mobile`, `headline-md`, `headline-sm`, `title-md`, `body-lg`, `body-md`, `body-emphasis`, `body-sm`, `label-lg`, `label-md`, `label-sm`. Each carries size, line height, letter spacing, and weight. Do not set raw `fontSize` / `lineHeight` manually when a token exists.
- React Native does not pick a font file from `fontWeight` alone for custom fonts. Before changing text styles or font loading, check how the font files are registered in the root layout and follow the existing approach. Do not assume weights work automatically.
- Dense numbers (VND prices, weights) should use tabular figures when available (`fontVariant: ['tabular-nums']`).

```tsx
<Text className="font-vietnam text-headline-md text-ink">Sản phẩm hữu cơ</Text>
<Text className="font-vietnam text-body-md text-muted">Rau củ tươi, có nguồn gốc rõ ràng.</Text>
```

### Radii

Configured values: `rounded` = 8px (buttons, inputs), `rounded-md` = 12px, `rounded-lg` = 16px (cards, sheets, dialogs), `rounded-xl` = 24px, `rounded-full` for pills (chips, badges, status tags). Note: DESIGN.md's `rounded-xl` for the dark primary button means this 24px token; follow `DESIGN.md` component specs.

### Translate web terms to React Native

| `DESIGN.md` says                    | Do this in the app                                                                                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rem`                               | 1rem = 16px                                                                                                                                                                                                                               |
| `box-shadow`, glow                  | Check the shadow support for RN 0.88 in the docs (Android also uses `elevation`). Do not assume CSS shadows work. Prefer tonal layering (surface tokens) over shadows.                                                                    |
| backdrop blur / translucent scrim   | Do NOT use blur or glass effects (`expo-blur`, `expo-glass-effect`, `backdrop-filter`). iOS and Android must look identical. Use opaque surface tokens, or a semi-transparent token such as `bg-surface/90` where translucency is wanted. |
| `env(safe-area-inset-bottom)`       | `react-native-safe-area-context` (`useSafeAreaInsets` / `SafeAreaView`)                                                                                                                                                                   |
| `1.5px` / hairline borders          | RN `borderWidth`; `StyleSheet.hairlineWidth` for hairlines                                                                                                                                                                                |
| hover / pressed states              | Use `Pressable` pressed/focus states; hover does not apply on touch                                                                                                                                                                       |
| Breakpoints (<640, 640-1024, >1024) | `useWindowDimensions`; mobile is the primary target                                                                                                                                                                                       |
| gradient (freshness gauge)          | `expo-linear-gradient`                                                                                                                                                                                                                    |

### Layout and components

- Mobile-first, thumb-reach layout. Spacing follows the 8pt system (4pt half-steps for compact metadata).
- Interactive controls are at least 48px tall (buttons, inputs).
- No heavy drop shadows. Depth comes from tonal layering of surfaces.
- The bottom tab bar is a **floating bar** (inset from screen edges, rounded, with an animated pill indicator behind the active tab). It is not an edge-to-edge docked bar. Follow the "Bottom Navigation Bar" section of `DESIGN.md` and the existing `BottomTabBar` component; do not redesign it. Respect device safe-area insets with `useSafeAreaInsets`.
- Implement components exactly as specified in the "Components" section of `DESIGN.md` (buttons, chips, product cards, inputs, selection controls, bottom navigation, Produce Origin Tracker). Build each once as a reusable component and reuse it; do not re-style per screen. Merge classNames with the existing `clsx` + `tailwind-merge` helper (look for an existing `cn` utility before creating one).

### Language

- UI copy is **Vietnamese** with full diacritics (for example "Thêm vào giỏ", "Sản phẩm hữu cơ"). Never strip diacritics. Avoid fixed heights that clip accents.
- Code, identifiers, and comments are in English.

## Definition of done

- `npx expo lint` and `npx tsc --noEmit` pass.
- UI matches `DESIGN.md` in BOTH light and dark themes.
- No hard-coded colors, fonts, or radii in components; only the tokens above.
- No new dependency added without `npx expo install` and a check of Expo-recommended modules.
