const productLink = /^organiccorporateapp:\/{2,3}product\/([a-z0-9-]+)\/?(?:[?#].*)?$/i;
const webLink = /^https?:\/\/[^/?#@]+(?:[/?#]|$)/i;

export function readQrResult(rawData: string) {
  const data = rawData.trim();
  if (!data) return null;

  const productCode = productLink.exec(data)?.[1] ?? (/^[a-z0-9-]+$/i.test(data) ? data : null);
  let url: string | null = null;
  if (webLink.test(data) && !/[\s\\]/.test(data)) {
    try {
      const parsed = new URL(data);
      if (parsed.hostname) url = parsed.href;
    } catch {
      // Keep invalid links available as text.
    }
  }

  return { data: rawData, productId: productCode?.toLowerCase() ?? null, url };
}
