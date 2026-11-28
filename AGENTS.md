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
- Also installed: `expo-linear-gradient`, `react-native-safe-area-context`, `react-native-keyboard-controller`, `expo-camera`, `expo-location`, `expo-notifications`, `expo-calendar`
- Installed but **do not use** (conflicts with the design rules below): `expo-glass-effect`, `expo-symbols`, `@expo/ui`. They are not cross-platform or produce blur/glass effects.

Use what is already installed. Do not add a second library for something already covered (for example another state manager, form library, icon set, or storage). Before adding any new dependency, check the Expo-recommended modules and ask if unsure.

## Read order

1. This file: how to work in the repo (commands, structure, data layer, rules).
2. `DESIGN.md`: the visual design system (brand, typography, spacing, shapes, components).
3. `global.css` and `tailwind.config.js`: the actual implemented color tokens and type scale.

Read `DESIGN.md` before creating or changing ANY UI: screens, components, styles, theme, or tailwind/NativeWind config. Do not write UI from memory or from generic defaults.

If this file and `DESIGN.md` seem to conflict, follow the "Design system rules" section below. If still unclear, ask instead of guessing.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json` (currently 58).
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

The same applies to NativeWind, Reanimated, FlashList, react-native-mmkv, zod, and `@tanstack/react-query`: check their current docs for the installed major version (APIs differ between majors, for example MMKV and zod).

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

## Project structure

```
src/
  app/                      # expo-router routes ONLY. Thin: render screens from features
  config/
    env.ts                  # validated environment variables
  lib/
    api.ts                  # CENTRAL API LAYER (axios + interceptors). Do not edit unless asked
    queryClient.ts          # shared QueryClient
    api-error.ts            # getErrorMessage and error normalization
    cn.ts                   # clsx + tailwind-merge helper (reuse if it already exists)
  utils/
    secure-store.ts         # expo-secure-store wrapper (async): secureStorage, secureStore helpers
    mmkv.ts                 # react-native-mmkv instance + zustand storage adapter (sync)
    token.ts                # get/save/clear access + refresh token (SecureStore + memory cache)
  hooks/                    # generic hooks used by 2+ features (useDebounce, useThemeColors)
  components/               # shared UI (Button, Chip, ProductCard base...). No API knowledge
  features/
    <feature>/              # for example: auth, product, cart, order, profile
      api/<name>.api.ts     # functions that call the backend (axios + zod parse only)
      schemas/<name>.schema.ts   # zod schemas and inferred types
      hooks/                # react-query hooks
        use<Name>.ts
        <name>.keys.ts      # query key factory
      store/<name>.store.ts # zustand store (only if there is client state)
      components/           # components used only by this feature
      screens/              # screens rendered by routes in src/app
      index.ts              # public exports of the feature
```

Placement rules:

- Code belongs to a feature by default. Move to `lib/`, `utils/`, `hooks/`, or `components/` only when **two or more features** use it.
- A feature never imports deep files of another feature (`features/a/hooks/x`). Import from `features/a` (its `index.ts`) only.
- Files in `src/app/` only declare routes and render a screen from `features/*/screens`. No API calls or business logic there.
- Use the `@/` alias for `src/`. File names: `kebab-case` for folders, `<name>.api.ts`, `<name>.schema.ts`, `<name>.keys.ts`, `<name>.store.ts`; hooks are `useXxx`; stores export `useXxxStore`.

## Data & API layer

Single rule: **server data belongs to react-query; data created by the app belongs to zustand.**

| Tool                    | Only for                                                                                 | Never for                       |
| ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------------- |
| `lib/api.ts` (axios)    | Sending HTTP requests. Attaches token, refreshes on 401, logs out when the session ends  | Creating another axios instance |
| `zod`                   | Validating backend responses and form input; types come from `z.infer`                   | Business logic                  |
| `@tanstack/react-query` | Server state: fetch, cache, pagination, mutations                                        | Local UI state                  |
| `zustand`               | Client state shared across screens: session user, theme, language, local-only cart draft | Copies of server data           |
| `utils/token.ts`        | Access and refresh tokens (SecureStore)                                                  | Anything else                   |

### When to use what

| Situation                                              | Use                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| Fetch data to display (GET)                            | `useQuery`                                                         |
| Paginated list, infinite scroll                        | `useInfiniteQuery` + `FlashList`                                   |
| Create, update, delete                                 | `useMutation`, then `invalidateQueries` for affected keys          |
| Logged-in user / session                               | `authStore` (zustand) + login mutation; tokens in `utils/token.ts` |
| Theme, language, onboarding flag                       | zustand with MMKV persistence                                      |
| Cart stored on the backend                             | react-query (server state)                                         |
| Cart kept only on device until checkout                | zustand                                                            |
| State used by a single screen (modal open, typed text) | `useState`                                                         |
| Validate a backend response                            | `schema.parse(...)` inside the `features/<x>/api` function         |
| Validate a form                                        | zod schema + `react-hook-form` (`zodResolver`)                     |
| Search while typing                                    | `useDebounce` before the value goes into the query key             |
| Data needed right after a mutation                     | `invalidateQueries` or `setQueryData`; never write it to zustand   |

### Data flow (one direction)

```
Screen / Component
  -> hook (react-query)          features/x/hooks
     -> api function             features/x/api
        -> lib/api.ts (axios)    -> backend
     <- zod parse                features/x/schemas
  <- typed data
```

Each layer calls only the layer directly below. Components never call `lib/api` or `features/*/api` directly; they go through a hook.

### Rules per layer

**`lib/api.ts`**

- The only place that calls `axios.create` (plus the existing `authClient` used for refresh).
- Handles `Authorization`, 401 refresh, and forced logout. Features must NOT attach tokens, refresh tokens, or handle 401 themselves.
- Do not import `axios` in features. Exception: `axios.isAxiosError` for type checks.
- Read/write tokens only through `utils/token.ts`.

**`features/<x>/schemas`**

- Every backend response and every form input has a zod schema. Derive types with `z.infer`; never hand-write a duplicate type.
- Be tolerant where the backend is loose: `.optional()`, `.nullable()`, `z.coerce.number()` for numbers that may arrive as strings.

**`features/<x>/api`**

- Plain async functions: call `api`, unwrap the envelope (`data?.data ?? data`, same as `lib/api.ts`), `schema.parse`, return typed data.
- No hooks, no zustand. Use `params` for query strings, never string concatenation.

**`features/<x>/hooks`**

- All `useQuery` / `useInfiniteQuery` / `useMutation` live here.
- Query keys come from the feature's `<name>.keys.ts` factory, never written inline in components.
- Queries that need a login get `enabled: !!user` (guests must not fire them).
- Mutations must `invalidateQueries` the right keys on success.
- Do not swallow errors in `try/catch`; let react-query hold them. Do not retry on 401 (already configured in `queryClient`).

**`features/<x>/store`**

- Create a store only for shared client state. Keep it small. Use selectors: `useAuthStore((s) => s.user)`.
- Use `persist` + `partialize` so transient flags are not saved. Outside React use `useXStore.getState()`.

**Components and screens**

- Use the feature's hooks only. Never import `axios` or `lib/api`.
- Always handle four states: loading, error, empty, data. Show errors with `getErrorMessage(error)`.

### Error handling

- 401 is handled in `lib/api.ts`. Guests receive the raw 401; the screen shows "Vui lòng đăng nhập".
- Network errors (no `response`) keep the session and allow retry.
- zod validation failure means the backend returned an unexpected shape: log in DEV, show a generic message, never crash.
- Never log tokens, passwords, or request bodies.

### Forbidden

- Calling `axios.get/post` or `fetch` from components, hooks, or features.
- Creating a new `axios.create` outside `lib/api.ts`.
- Attaching `Authorization`, refreshing tokens, or handling 401 inside a feature.
- Storing tokens in zustand, `useState`, MMKV, or AsyncStorage.
- Copying `useQuery` data into zustand or `useState` as a second source of truth.
- Hand-written types that duplicate a zod schema.
- Inline query keys in components.
- `useEffect` + `useState` to fetch data.
- Deep imports into another feature's internals.

### Reference implementation: feature `product`

Use this as the template when adding a feature.

`features/product/schemas/product.schema.ts`

```typescript
import { z } from "zod";

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.coerce.number(),
  image: z.string().nullable().optional(),
});
export type Product = z.infer<typeof productSchema>;

export const productPageSchema = z.object({
  items: z.array(productSchema),
  page: z.number(),
  totalPages: z.number(),
});
export type ProductPage = z.infer<typeof productPageSchema>;
```

`features/product/api/product.api.ts`

```typescript
import api from "@/lib/api";
import { productPageSchema, type ProductPage } from "../schemas/product.schema";

export const productApi = {
  getList: async (params: {
    page: number;
    limit?: number;
    keyword?: string;
  }): Promise<ProductPage> => {
    const { data } = await api.get("/products", {
      params: { limit: 10, ...params, keyword: params.keyword || undefined },
    });
    return productPageSchema.parse(data?.data ?? data);
  },
};
```

`features/product/hooks/product.keys.ts`

```typescript
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (keyword: string) => [...productKeys.lists(), keyword] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};
```

`features/product/hooks/useProducts.ts`

```typescript
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { productApi } from "../api/product.api";
import { productKeys } from "./product.keys";

export const useProducts = (keyword = "") =>
  useInfiniteQuery({
    queryKey: productKeys.list(keyword),
    queryFn: ({ pageParam }) =>
      productApi.getList({ page: pageParam, keyword }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
```

`features/product/screens/product-list-screen.tsx` (UI follows the design system: FlashList, expo-image, tokens, Vietnamese copy)

```tsx
import { useMemo, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useDebounce } from "@/hooks/useDebounce";
import { useThemeColors } from "@/hooks/useThemeColors";
import { getErrorMessage } from "@/lib/api-error";
import { useProducts } from "../hooks/useProducts";
import type { Product } from "../schemas/product.schema";

const ProductItem = ({ item }: { item: Product }) => (
  <View className="flex-row gap-3 rounded-lg bg-surface p-3">
    <View className="h-16 w-16 overflow-hidden rounded-md bg-surface-container">
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      ) : null}
    </View>
    <View className="flex-1 justify-center">
      <Text numberOfLines={2} className="font-vietnam text-title-md text-ink">
        {item.name}
      </Text>
      <Text
        className="font-vietnam text-body-emphasis text-primary"
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {item.price.toLocaleString("vi-VN")}đ
      </Text>
    </View>
  </View>
);

export function ProductListScreen() {
  const colors = useThemeColors();
  const [keyword, setKeyword] = useState("");
  const debounced = useDebounce(keyword);
  const q = useProducts(debounced);

  const products = useMemo(
    () => q.data?.pages.flatMap((p) => p.items) ?? [],
    [q.data],
  );

  if (q.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (q.isError) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-canvas px-6">
        <Text className="font-vietnam text-body-md text-muted">
          {getErrorMessage(q.error)}
        </Text>
        <Text
          onPress={() => q.refetch()}
          className="font-vietnam text-label-lg text-primary"
        >
          Thử lại
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Tìm sản phẩm hữu cơ..."
        placeholderTextColor={colors.muted}
        className="m-4 h-12 rounded border border-border bg-surface px-3 font-vietnam text-body-md text-ink"
      />
      <FlashList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductItem item={item} />}
        ItemSeparatorComponent={() => <View className="h-2" />}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <Text className="mt-8 text-center font-vietnam text-body-md text-muted">
            Chưa có sản phẩm
          </Text>
        }
        ListFooterComponent={
          q.isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} className="my-4" />
          ) : null
        }
        refreshing={q.isRefetching && !q.isFetchingNextPage}
        onRefresh={() => q.refetch()}
        onEndReached={() => {
          if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
```

Check the installed FlashList major version in its docs for required props (for example `estimatedItemSize` was required in v1 and removed in v2). The "Thử lại" link should become the shared Button component once it exists.

### Checklist: adding a new API

1. Decide server state vs client state (table above).
2. Add or update the zod schema in `features/<x>/schemas` and infer the type.
3. Add the function in `features/<x>/api/<x>.api.ts`: call `api`, unwrap, `schema.parse`.
4. Add keys to `<x>.keys.ts`.
5. Add the hook in `features/<x>/hooks`. Mutations must invalidate affected keys. Add `enabled` if login is required.
6. Build UI with the hook: handle loading, error, empty, data. Use the design tokens and `FlashList` for lists.
7. Export from `features/<x>/index.ts` only what other features need.
8. Run lint and typecheck.

## Storage

Two storages, two purposes. Do not mix them.

| Storage             | Module                  | Use for                                                             | Notes                                                                                            |
| ------------------- | ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `expo-secure-store` | `utils/secure-store.ts` | Access/refresh tokens, other secrets, small PII                     | Async. Keep values small (about 2 KB). Keys may only contain letters, digits, `.`, `-`, `_`      |
| `react-native-mmkv` | `utils/mmkv.ts`         | Theme choice, language, onboarding flags, light non-sensitive cache | Synchronous. Check the docs for the installed MMKV major version (API differs between v3 and v4) |

Rules:

- Tokens only in SecureStore, only through `utils/token.ts`. Never in MMKV, zustand, or react-query.
- Zustand `persist` for non-sensitive stores (theme, language) uses an MMKV adapter. Stores that hold sensitive data use the SecureStore adapter.
- Do not persist the react-query cache into SecureStore. If cache persistence is ever needed, ask first.
- Name the SecureStore helper object `secureStore` (not `storage`) so it is not confused with MMKV.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

### Guests and protected routes

- Guests can browse public content (products, categories). Login is required for private areas (profile, orders, checkout). Gate those with Expo Router protected routes (check the docs for the SDK 58 API), not with scattered `if (!user)` checks in screens.
- In the root layout, register the logout callback once: `setOnLogout(...)` from `lib/api.ts` resets zustand stores, clears the query cache, and navigates to the login route. Call `resetLogoutFlag()` after a successful login.
- Wait for zustand hydration before rendering routes that depend on the session.

## Environment variables

- Define and validate them in `src/config/env.ts`. Only `EXPO_PUBLIC_*` variables are readable in the app.
- `EXPO_PUBLIC_*` values are bundled into the app and visible to anyone. Never put secrets or private keys there.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Platform rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries. Before adding a dependency, check `package.json` for something already installed and the Expo docs for a recommended module: https://docs.expo.dev/versions/latest/index.md

## Component rules

- Use FlashList (not FlatList/ScrollView) for product lists and any long or dynamic list.
- Use `expo-image` (not RN `Image`) for photography.
- Store tokens and secrets in `expo-secure-store`, never in MMKV.

## Design system rules

`DESIGN.md` is the source for visual design intent. It was written in a web-style vocabulary (CSS, rem, box-shadow), but this app is React Native + NativeWind. Apply the rules below.

### Where color values live (source of truth)

- **Implemented colors live in `global.css`** as RGB-channel CSS variables (`--color-*`), light in `:root`, dark in `.dark:root`. `tailwind.config.js` maps them to Tailwind utilities. These match the hex values in the PROSE sections of `DESIGN.md` (for example primary `#006B35` = `0 107 53`; dark canvas `#121614` = `18 22 20`).
- The YAML frontmatter `colors` / `colors-dark` in `DESIGN.md` is a Material-style map with DIFFERENT hex values (for example primary `#005026`). Do NOT use those hex values and do not mix the two. Ignore the frontmatter colors for implementation.
- Never hard-code hex/rgb colors in components. Use the Tailwind tokens below. If a needed color has no token, add a `--color-*` variable to BOTH `:root` and `.dark:root` in `global.css`, map it in `tailwind.config.js`, using the value from `DESIGN.md` prose, then use the token.
- Exception for props that cannot take a className (for example `lucide-react-native` icon `color`, `ActivityIndicator` color, `placeholderTextColor`, reanimated styles, shadow colors): do NOT hard-code hex in each component. Read colors from one shared hook (`useThemeColors()` in `src/hooks`, which returns values matching `global.css` for the current scheme). If the hook does not exist yet, create it once, with values copied from `global.css`, and reuse it.
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
- Implement components exactly as specified in the "Components" section of `DESIGN.md` (buttons, chips, product cards, inputs, selection controls, bottom navigation, Produce Origin Tracker). Build each once as a reusable component in `src/components` and reuse it; do not re-style per screen. Merge classNames with the existing `clsx` + `tailwind-merge` helper (look for an existing `cn` utility before creating one).

### Language

- UI copy is **Vietnamese** with full diacritics (for example "Thêm vào giỏ", "Sản phẩm hữu cơ"). Never strip diacritics. Avoid fixed heights that clip accents.
- Code, identifiers, and comments are in English.

## Definition of done

- `npx expo lint` and `npx tsc --noEmit` pass.
- Data flows through the layers above: hook -> `features/*/api` -> `lib/api.ts`, responses validated with zod, query keys from the factory, no server data copied into zustand.
- UI matches `DESIGN.md` in BOTH light and dark themes.
- No hard-coded colors, fonts, or radii in components; only the tokens above.
- No new dependency added without `npx expo install` and a check of Expo-recommended modules.
- `lib/api.ts` is unchanged unless the task explicitly required it.
