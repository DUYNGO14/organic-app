const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { readFileSync } = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const { test } = require("node:test");
const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const { createTokenStorage } = require("../src/features/auth/tokenStorage.ts");
const { createAuthSession } = require("../src/features/auth/authSession.ts");
const { createAuthTransport } = require("../src/features/auth/authTransport.ts");
const { getAuthReturnPath } = require("../src/features/auth/auth-return-path.ts");

const originalLoad = Module._load;
const { api: appApi, default: defaultApi, installAuthInterceptors } = (() => {
  Module._load = function (name, parent, isMain) {
    if (name === "expo-crypto") return { randomUUID };
    if (name === "expo/fetch") return { fetch: globalThis.fetch };
    if (name === "@/lib/storage") return { storage: {} };
    const resolved = name.startsWith("@/") ? path.resolve(__dirname, "../src", name.slice(2)) : name;
    return originalLoad.call(this, resolved, parent, isMain);
  };
  try {
    return require("../src/lib/axios.ts");
  } finally {
    Module._load = originalLoad;
  }
})();

const backend = "https://backend.test";
const expired = [401, { errorCode: "ACCESS_TOKEN_EXPIRED" }];
const renewal = { accessToken: "new-access", refreshToken: "new-refresh" };
const firstSession = {
  accessToken: "old-access",
  refreshToken: "old-refresh",
  userData: { name: "A", phone: "0300000001" },
};
const tokenKey = "auth.session.v1";
const legacyKey = "organic-auth-session";
const refreshEndpoint = "/auth/login/refreshToken";
const success = (data) => ({ success: true, code: 200, message: "OK", data });

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

async function fixture({ signIn = firstSession, legacy, noSession = false } = {}) {
  const records = new Map(legacy ? [[legacyKey, JSON.stringify(legacy)]] : []);
  const writes = [];
  const revoked = [];
  const events = [];
  const storage = {
    getString: async (key) => records.get(key) ?? null,
    setString: async (key, value) => {
      records.set(key, value);
      writes.push(key);
    },
    remove: async (key) => void records.delete(key),
  };
  const refreshClient = axios.create({ baseURL: backend });
  const refresh = new MockAdapter(refreshClient, { onNoMatch: "throwException" });
  refresh.onPost("/auth/logout").reply((config) => {
    revoked.push(JSON.parse(config.data).refreshToken);
    return [200];
  });
  const transport = createAuthTransport(refreshClient, true);
  const manager = createAuthSession(
    createTokenStorage(storage, randomUUID),
    transport.refreshTokens,
    transport.revokeSession,
  );
  manager.setChangeHandler((session, reason) => events.push([session?.user?.name, reason]));
  if (legacy) await manager.bootstrap();
  else if (!noSession) await manager.signIn(signIn);

  const api = axios.create({ baseURL: backend });
  const normal = new MockAdapter(api, { onNoMatch: "throwException" });
  installAuthInterceptors(api, manager, backend, randomUUID);

  return { records, writes, revoked, events, storage, refresh, manager, api, normal };
}

function replyWithToken(config) {
  return config.headers.get("Authorization") === "Bearer new-access" ? [200, "ok"] : expired;
}

test("services receive a normal Axios response from the shared client", async () => {
  assert.equal(defaultApi, appApi);
  const mock = new MockAdapter(appApi);
  try {
    const status = { active: true };
    mock.onGet("/mining/status").reply(200, status);
    const response = await appApi.get("/mining/status");
    assert.deepEqual(response.data, status);
  } finally {
    mock.restore();
  }
});

test("ten simultaneous 401s share a refresh and preserve mutation idempotency keys", async () => {
  const { api, normal, refresh, records, writes } = await fixture();
  refresh.onPost(refreshEndpoint).reply(200, success(renewal));
  normal.onPost("/orders").reply(replyWithToken);
  const result = await Promise.all(Array.from({ length: 10 }, (_, id) => api.post("/orders", { id })));
  assert.equal(result.length, 10);
  assert.equal(refresh.history.post.length, 1);
  assert.deepEqual(JSON.parse(refresh.history.post[0].data), { refreshToken: "old-refresh" });
  assert.equal(normal.history.post.length, 20);
  const keys = new Map();
  for (const request of normal.history.post) {
    const { id } = JSON.parse(request.data);
    const key = request.headers.get("Idempotency-Key");
    assert.match(key, /^[\da-f-]{36}$/i);
    if (keys.has(id)) assert.equal(key, keys.get(id));
    else keys.set(id, key);
  }
  assert.equal(new Set(keys.values()).size, 10);
  assert.equal(writes.filter((key) => key === tokenKey).length, 2);
  const saved = JSON.parse(records.get(tokenKey));
  assert.equal(saved.refreshToken, renewal.refreshToken);
  assert.equal(saved.accessToken, renewal.accessToken);
});

test("late 401 uses the rotated token and a retried 401 stops", async () => {
  const { api, normal, refresh } = await fixture();
  const late = deferred();
  refresh.onPost(refreshEndpoint).reply(200, success(renewal));
  normal.onGet("/late").reply(async (config) => {
    if (config.headers.get("Authorization") === "Bearer old-access") await late.promise;
    return replyWithToken(config);
  });
  normal.onGet("/first").reply(replyWithToken);
  normal.onGet("/rejected").reply(...expired);
  const waiting = api.get("/late");
  await api.get("/first");
  late.resolve();
  assert.equal((await waiting).status, 200);
  assert.equal(refresh.history.post.length, 1);
  await assert.rejects(api.get("/rejected"), (error) => error.response?.status === 401);
  assert.equal(normal.history.get.filter(({ url }) => url === "/rejected").length, 2);
  assert.equal(refresh.history.post.length, 2);
});

test("terminal refresh error signs out once and callers keep their original 401", async () => {
  const { api, normal, refresh, records, events, manager } = await fixture();
  refresh.onPost(refreshEndpoint).reply(401, { errorCode: "REFRESH_TOKEN_REUSED" });
  normal.onGet("/catalog").reply(...expired);
  const results = await Promise.allSettled(Array.from({ length: 4 }, () => api.get("/catalog")));
  for (const result of results) assert.equal(result.reason?.response?.data?.errorCode, expired[1].errorCode);
  assert.equal(refresh.history.post.length, 1);
  assert.equal(events.filter(([, reason]) => reason === "expired").length, 1);
  assert.equal(manager.getSnapshot(), null);
  assert.equal(records.size, 0);
});

for (const [name, configure] of [
  ["validation", (handler) => handler.reply(400, { errorCode: "VALIDATION_ERROR" })],
  ["rate limit", (handler) => handler.reply(429)],
  ["server failure", (handler) => handler.reply(503)],
  ["timeout", (handler) => handler.timeout()],
  ["network failure", (handler) => handler.networkError()],
  ["wrong payload", (handler) => handler.reply(200, {})],
  ["unknown rejection code", (handler) => handler.reply(401, { errorCode: "OTHER" })],
]) {
  test(`refresh ${name} preserves the current token pair`, async () => {
    const { api, manager, normal, refresh } = await fixture();
    configure(refresh.onPost(refreshEndpoint));
    normal.onGet("/catalog").reply(...expired);
    await assert.rejects(api.get("/catalog"));
    assert.equal(manager.getSnapshot().accessToken, firstSession.accessToken);
    assert.equal(manager.getSnapshot().refreshToken, firstSession.refreshToken);
  });
}

test("missing refresh expires a real session; omitted rotation keeps the old refresh token", async () => {
  const missing = await fixture({ signIn: { accessToken: "only-access" } });
  missing.normal.onGet("/catalog").reply(...expired);
  await assert.rejects(missing.api.get("/catalog"));
  assert.equal(missing.manager.getSnapshot(), null);
  assert.equal(missing.refresh.history.post.length, 0);

  const retained = await fixture();
  retained.refresh.onPost(refreshEndpoint).reply(200, success({ accessToken: renewal.accessToken }));
  retained.normal.onGet("/catalog").reply(replyWithToken);
  await retained.api.get("/catalog");
  assert.equal(retained.manager.getSnapshot().refreshToken, firstSession.refreshToken);
});

test("failed SecureStore rotation leaves both tokens intact", async () => {
  const { api, normal, refresh, manager, storage, records } = await fixture();
  const before = records.get(tokenKey);
  storage.setString = async () => { throw new Error("Storage write failed"); };
  refresh.onPost(refreshEndpoint).reply(200, success(renewal));
  normal.onGet("/catalog").reply(...expired);
  await assert.rejects(api.get("/catalog"), /Storage write failed/);
  assert.equal(records.get(tokenKey), before);
  assert.equal(manager.getSnapshot().accessToken, firstSession.accessToken);
  assert.equal(manager.getSnapshot().refreshToken, firstSession.refreshToken);
});

test("request exclusions and account-disabled handling", async () => {
  const { api, normal, refresh, manager } = await fixture();
  normal.onAny().reply((config) => {
    if (config.url === "/disabled") return [403, { errorCode: "ACCOUNT_DISABLED" }];
    if (config.url === "/forbidden") return [403, { errorCode: "FORBIDDEN" }];
    return config.url === "/auth/login-history" ? replyWithToken(config) : expired;
  });
  for (const path of [
    "/auth/login", "/auth/register", "/auth/login/refreshToken", "/auth/otp/verify",
    "/auth/verifyOtp", "/auth/nested/%2e%2e/login",
    "https://another.test/catalog", "https://backend.test@another.test/catalog",
  ]) {
    await assert.rejects(api.get(path));
    assert.equal(normal.history.get.at(-1).headers.has("Authorization"), false);
  }
  await assert.rejects(api.get("/catalog", { skipAuthRefresh: true }));
  assert.equal(normal.history.get.at(-1).headers.has("Authorization"), false);
  await assert.rejects(api.get("/catalog", { retryOnAuth: false }));
  await assert.rejects(api.get("/forbidden"));
  assert.equal(refresh.history.post.length, 0);
  refresh.onPost(refreshEndpoint).reply(200, success(renewal));
  await api.get("/auth/login-history");
  assert.equal(refresh.history.post.length, 1);
  await assert.rejects(api.get("/disabled"));
  assert.equal(manager.getSnapshot(), null);

  for (const flags of [{ noSession: true }, { signIn: { accessToken: "demo-user" } }]) {
    const item = await fixture(flags);
    item.normal.onGet("/catalog").reply(...expired);
    await assert.rejects(item.api.get("/catalog"));
    assert.equal(item.normal.history.get[0].headers.has("Authorization"), false);
    assert.equal(item.refresh.history.post.length, 0);
  }
});

test("canceled waiter settles before refresh without canceling other requests", async () => {
  const { api, normal, refresh } = await fixture();
  const started = deferred();
  const release = deferred();
  refresh.onPost(refreshEndpoint).reply(async () => {
    started.resolve();
    await release.promise;
    return [200, success(renewal)];
  });
  normal.onGet("/catalog").reply(replyWithToken);
  const controller = new AbortController();
  const first = api.get("/catalog", { signal: controller.signal });
  const second = api.get("/catalog");
  await started.promise;
  controller.abort();
  await assert.rejects(first, { code: "ERR_CANCELED" });
  release.resolve();
  await second;
  assert.equal(normal.history.get.length, 3);
  assert.equal(refresh.history.post.length, 1);
});

test("logout and sign-in invalidate an in-flight refresh and old responses", async () => {
  const { api, normal, refresh, manager, records } = await fixture();
  const started = deferred();
  const release = deferred();
  const late = deferred();
  refresh.onPost(refreshEndpoint).reply(async () => {
    started.resolve();
    await release.promise;
    return [200, success(renewal)];
  });
  normal.onGet("/catalog").reply(replyWithToken);
  normal.onGet("/slow").reply(async () => {
    await late.promise;
    return [200, "private old response"];
  });
  const obsolete = assert.rejects(api.get("/catalog"));
  const oldResponse = assert.rejects(api.get("/slow"), { code: "ERR_CANCELED" });
  await started.promise;
  const logout = manager.signOut();
  const next = manager.signIn({ accessToken: "account-b", userData: { name: "B" } });
  release.resolve();
  await Promise.all([logout, next, obsolete]);
  late.resolve();
  await oldResponse;
  assert.equal(manager.getSnapshot().user.name, "B");
  assert.equal(JSON.parse(records.get(tokenKey)).accessToken, "account-b");
  assert.equal(normal.history.get.filter(({ url }) => url === "/catalog").length, 1);
});

test("migrates legacy SecureStore session and clears its separately saved profile on logout", async () => {
  const { manager, records, revoked } = await fixture({ legacy: firstSession });
  assert.equal(records.has(legacyKey), false);
  const credentials = JSON.parse(records.get(tokenKey));
  assert.equal(credentials.userData, undefined);
  assert.equal(manager.getSnapshot().user.phone, firstSession.userData.phone);
  await manager.signOut();
  await Promise.resolve();
  assert.deepEqual(revoked, ["old-refresh"]);
  assert.equal(records.size, 0);
});

test("legacy HTTP-only 401 refreshes, but an explicit unrelated code does not", async () => {
  const { api, normal, refresh, manager } = await fixture();
  normal.onGet("/unrelated").reply(401, { errorCode: "INVALID_CREDENTIALS" });
  await assert.rejects(api.get("/unrelated"));
  assert.equal(refresh.history.post.length, 0);
  normal.onGet("/legacy").reply((config) => (
    config.headers.get("Authorization") === "Bearer old-access" ? [401] : [200]
  ));
  refresh.onPost(refreshEndpoint).reply(200, success(renewal));
  await api.get("/legacy");
  assert.equal(refresh.history.post.length, 1);
  refresh.onPost(refreshEndpoint).reply(403);
  normal.onGet("/expired").reply(401, { errorCode: "ACCESS_TOKEN_INVALID" });
  await assert.rejects(api.get("/expired"));
  assert.equal(manager.getSnapshot(), null);
});

test("logout invalidates a sign-in that has started writing to storage", async () => {
  const { manager, storage, records } = await fixture({ noSession: true });
  const started = deferred();
  const release = deferred();
  const write = storage.setString;
  storage.setString = async (key, value) => {
    if (key === tokenKey) {
      started.resolve();
      await release.promise;
    }
    await write(key, value);
  };
  const abandonedSignIn = assert.rejects(manager.signIn(firstSession));
  await started.promise;
  const logout = manager.signOut();
  release.resolve();
  await Promise.all([abandonedSignIn, logout]);
  assert.equal(manager.getSnapshot(), null);
  assert.equal(records.size, 0);
});

test("post-login targets are limited to local protected routes", () => {
  assert.equal(getAuthReturnPath("/product/a-1?ref=home"), "/product/a-1?ref=home");
  assert.equal(getAuthReturnPath("organiccorporateapp://product/a-1?ref=home"), "/product/a-1?ref=home");
  for (const path of ["/login", "//outside.test/home", "https://outside.test/home", "/../cart"]) {
    assert.equal(getAuthReturnPath(path), null);
  }
});
