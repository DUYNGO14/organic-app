const protectedPath =
  /^\/(?:home|categories|farm|orders|profile|cart|notifications|scan-qr|product\/[a-z0-9_-]+)\/?$/i;

export function getAuthReturnPath(href: string) {
  const local = href.replace(/^organiccorporateapp:\/\/\/?/i, "/");
  const path = local.split(/[?#]/, 1)[0];
  return protectedPath.test(path) && !/[\\\s]/.test(local) ? local : null;
}
