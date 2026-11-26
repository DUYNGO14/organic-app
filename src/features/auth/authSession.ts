import type { AuthSession, User } from "@/types/user";
import { isRefreshRejected } from "./authErrors";
import { hasToken, type Tokens, type TokenStorage } from "./tokenStorage";

type ActiveSession = Awaited<ReturnType<TokenStorage["saveSession"]>> & { sid: number };
type SessionChange = "bootstrap" | "signin" | "signout" | "expired" | "updated";
type AuthEvent = `auth.refresh.${"start" | "success" | "rejected" | "transient_failure" | "retry" | "unauthorized" | "retry_unauthorized"}` |
  `auth.session.${"expired" | "signin" | "signout" | "cleanup_failed"}`;

export function logAuthEvent(
  event: AuthEvent,
  fields?: { durationMs?: number; status?: number },
) {
  if (
    (typeof __DEV__ !== "undefined" && __DEV__) ||
    process.env.EXPO_PUBLIC_AUTH_TELEMETRY === "true"
  ) {
    console.info({ event, ...fields });
  }
}

export class SessionExpiredError extends Error {}

export function createAuthSession(
  storage: TokenStorage,
  refreshTokens: (refreshToken: string) => Promise<Tokens>,
  revokeSession: (refreshToken: string) => Promise<unknown>,
) {
  let generation = 0;
  let active: ActiveSession | null = null;
  let task: { sid: number; promise: Promise<void> } | null = null;
  let pendingSignIn: number | undefined;
  let writes = Promise.resolve();
  let onChange: ((session: ActiveSession | null, reason: SessionChange) => void) | undefined;

  function enqueue<T>(operation: () => Promise<T>) {
    const result = writes.then(operation);
    writes = result.then(() => {}, () => {});
    return result;
  }

  function getSnapshot() {
    return active?.sid === generation ? active : null;
  }

  function publish(session: ActiveSession | null, reason: SessionChange) {
    active = session;
    onChange?.(session, reason);
  }

  function reconcileTransitions() {
    return { sid: ++generation, pending: task?.promise };
  }

  async function bootstrap() {
    const sid = generation;
    await enqueue(async () => {
      if (sid !== generation) return;
      const stored = await storage.readSession();
      if (sid === generation) publish(stored ? { ...stored, sid } : null, "bootstrap");
    });
  }

  async function signIn(session: AuthSession) {
    if (!hasToken(session.accessToken)) throw new Error("Thiếu access token.");
    const { sid, pending } = reconcileTransitions();
    pendingSignIn = sid;
    try {
      await pending?.catch(() => {});
      await enqueue(async () => {
        if (sid !== generation) throw new Error("Phiên đăng nhập đã thay đổi.");
        const previous = active;
        let stored: Awaited<ReturnType<TokenStorage["saveSession"]>>;
        try {
          stored = await storage.saveSession(session);
        } catch (error) {
          if (sid === generation && previous) publish({ ...previous, sid }, "updated");
          throw error;
        }
        // Track what was committed so the newest queued transition can clear it.
        active = { ...stored, sid };
        if (previous) {
          await storage.saveUser(previous.profileId, null).catch(() => {
            logAuthEvent("auth.session.cleanup_failed");
          });
        }
        if (sid !== generation) throw new Error("Phiên đăng nhập đã thay đổi.");
        publish(active, "signin");
        logAuthEvent("auth.session.signin");
      });
    } finally {
      if (pendingSignIn === sid) pendingSignIn = undefined;
    }
  }

  async function clearSession(
    sid: number,
    reason: "signout" | "expired",
    previous?: ActiveSession | null,
  ) {
    await enqueue(async () => {
      if (reason === "signout") {
        const session = sid === generation || active?.profileId === previous?.profileId
          ? active
          : previous;
        if (session?.refreshToken && !session.accessToken.startsWith("demo-")) {
          void revokeSession(session.refreshToken).catch(() => {});
        }
      }
      if (sid !== generation) return;
      try {
        await storage.clear(active?.profileId);
      } finally {
        active = null;
        if (sid === generation) {
          publish(null, reason);
          logAuthEvent(reason === "expired" ? "auth.session.expired" : "auth.session.signout");
        }
      }
    });
  }

  async function signOut() {
    if (!getSnapshot() && pendingSignIn !== generation) return;
    const previous = active;
    const { sid, pending } = reconcileTransitions();
    await pending?.catch(() => {});
    await clearSession(sid, "signout", previous);
  }

  async function expire(sid: number) {
    if (getSnapshot()?.sid !== sid) return;
    const expiredSid = ++generation;
    await clearSession(expiredSid, "expired").catch(() => {
      logAuthEvent("auth.session.cleanup_failed");
    });
  }

  function saveTokens(sid: number, tokens: Partial<Tokens>, expected?: ActiveSession) {
    return enqueue(async () => {
      const session = getSnapshot();
      if (!session || session.sid !== sid) return;
      if (expected && (
        expected.accessToken !== session.accessToken || expected.refreshToken !== session.refreshToken
      )) return;
      const updated = { ...session, ...tokens };
      await storage.saveTokens(session.profileId, updated);
      active = updated;
      if (sid === generation) publish(updated, "updated");
    });
  }

  function saveUserData(user: User) {
    const sid = getSnapshot()?.sid;
    return enqueue(async () => {
      const session = getSnapshot();
      if (!session || session.sid !== sid) throw new Error("Chưa có phiên đăng nhập.");
      const nextUser = { ...user, phone: user.phone ?? session.user?.phone };
      await storage.saveUser(session.profileId, nextUser);
      if (getSnapshot()?.sid === sid) publish({ ...session, user: nextUser }, "updated");
    });
  }

  async function doRefresh(sid: number) {
    const session = await enqueue(async () => getSnapshot());
    if (!session || session.sid !== sid) return;
    const startedAt = Date.now();
    logAuthEvent("auth.refresh.start");
    try {
      if (!session.refreshToken) throw new SessionExpiredError();
      const tokens = await refreshTokens(session.refreshToken);
      await saveTokens(sid, tokens, session);
      if (getSnapshot()?.sid === sid) {
        logAuthEvent("auth.refresh.success", { durationMs: Date.now() - startedAt });
      }
    } catch (error) {
      const current = getSnapshot();
      if (current?.sid !== sid || current.refreshToken !== session.refreshToken) return;
      if (error instanceof SessionExpiredError || isRefreshRejected(error)) {
        logAuthEvent("auth.refresh.rejected", { durationMs: Date.now() - startedAt });
        await expire(sid);
        throw new SessionExpiredError();
      }
      logAuthEvent("auth.refresh.transient_failure", { durationMs: Date.now() - startedAt });
      throw error;
    }
  }

  function refreshSession(sid: number) {
    if (task?.sid === sid) return task.promise;
    const promise = doRefresh(sid).finally(() => {
      if (task?.promise === promise) task = null;
    });
    task = { sid, promise };
    return promise;
  }

  return {
    bootstrap,
    expire,
    getSnapshot,
    refreshSession,
    saveTokens,
    saveUserData,
    signIn,
    signOut,
    setChangeHandler: (handler: typeof onChange) => { onChange = handler; },
  };
}

export type AuthSessionManager = ReturnType<typeof createAuthSession>;
