const productLink = /^organiccorporateapp:\/{2,3}product\/([a-z0-9-]+)\/?(?:[?#].*)?$/i;
const webLink = /^https?:\/\/[^/?#@]+(?:[/?#]|$)/i;
const batchLink = /^adigo:lot:([a-z0-9]+(?:-[a-z0-9]+)*)$/i;

type QrResult =
  | { kind: "batch"; batchCode: string }
  | { kind: "invalid-batch" }
  | { kind: "other"; data: string; productId: string | null; url: string | null };

export function readQrResult(rawData: string): QrResult | null {
  const data = rawData.trim();
  if (!data) return null;

  if (/^adigo:/i.test(data)) {
    const batchCode = batchLink.exec(data)?.[1];
    return batchCode && batchCode.length <= 40
      ? { kind: "batch", batchCode: batchCode.toUpperCase() }
      : { kind: "invalid-batch" };
  }

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

  return { kind: "other", data: rawData, productId: productCode?.toLowerCase() ?? null, url };
}
