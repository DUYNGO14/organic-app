import type { AuthSession, User } from "@/types/user";

const TOKEN_KEY = "auth.session.v1";
const LEGACY_KEY = "organic-auth-session";
const PROFILE_PREFIX = "auth.user.v1.";

type Storage = {
  getString(key: string): Promise<string | null>;
  setString(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};

export type Tokens = {
  accessToken: string;
  refreshToken?: string;
};

type TokenRecord = Tokens & {
  savedAt: number;
  profileId: string;
};

export function hasToken(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function profileFrom(value: unknown, phone?: unknown): User | null {
  const user = isRecord(value) ? { ...value } : {};
  const userPhone = typeof user.phone === "string" ? user.phone : phone;
  delete user.phone;
  if (typeof userPhone === "string") return { ...user, phone: userPhone };
  return Object.keys(user).length ? user : null;
}

export function createTokenStorage(storage: Storage, createId: () => string) {
  function saveTokens(profileId: string, { accessToken, refreshToken }: Tokens) {
    if (!hasToken(accessToken) || (refreshToken !== undefined && !hasToken(refreshToken))) {
      throw new Error("Thông tin xác thực không hợp lệ.");
    }
    const record: TokenRecord = { accessToken, refreshToken, profileId, savedAt: Date.now() };
    return storage.setString(TOKEN_KEY, JSON.stringify(record));
  }

  function saveUser(profileId: string, user: User | null) {
    const key = PROFILE_PREFIX + profileId;
    return user ? storage.setString(key, JSON.stringify(user)) : storage.remove(key);
  }

  async function saveSession(session: AuthSession) {
    const profileId = createId();
    const user = profileFrom(session.userData, session.phone);
    await saveUser(profileId, user);
    try {
      await saveTokens(profileId, session);
    } catch (error) {
      await saveUser(profileId, null).catch(() => {});
      throw error;
    }
    return { profileId, user, accessToken: session.accessToken, refreshToken: session.refreshToken };
  }

  async function readSession() {
    const raw = await storage.getString(TOKEN_KEY);
    if (raw !== null) {
      const record = parse(raw);
      if (
        !isRecord(record) || !hasToken(record.accessToken) ||
        typeof record.savedAt !== "number" || !Number.isFinite(record.savedAt) ||
        typeof record.profileId !== "string" || !/^[\da-f-]{36}$/i.test(record.profileId) ||
        (record.refreshToken !== undefined && !hasToken(record.refreshToken))
      ) {
        await clear();
        return null;
      }
      const user = profileFrom(parse(await storage.getString(PROFILE_PREFIX + record.profileId)));
      await storage.remove(LEGACY_KEY).catch(() => {});
      return { profileId: record.profileId, accessToken: record.accessToken,
        refreshToken: record.refreshToken, user };
    }

    const legacy = parse(await storage.getString(LEGACY_KEY));
    if (!isRecord(legacy) || !hasToken(legacy.accessToken)) {
      await storage.remove(LEGACY_KEY);
      return null;
    }
    const migrated = await saveSession({
      accessToken: legacy.accessToken,
      refreshToken: hasToken(legacy.refreshToken) ? legacy.refreshToken : undefined,
      userData: profileFrom(legacy.userData, legacy.phone) ?? undefined,
    });
    await storage.remove(LEGACY_KEY).catch(() => {});
    return migrated;
  }

  async function clear(profileId?: string) {
    try {
      await storage.remove(LEGACY_KEY);
      await storage.remove(TOKEN_KEY);
    } catch (error) {
      // Prevent a failed deletion from restoring a logged-out session on startup.
      await storage.setString(TOKEN_KEY, "null").catch(() => {});
      throw error;
    } finally {
      if (profileId) await saveUser(profileId, null);
    }
  }

  return { readSession, saveSession, saveTokens, saveUser, clear };
}

export type TokenStorage = ReturnType<typeof createTokenStorage>;
