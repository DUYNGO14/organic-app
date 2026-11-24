import { storage } from "@/lib/storage";
import { getLegalDocument } from "./legal.data";
import type { LegalAcceptance, LegalAcceptanceSource, LegalDocumentId, PrivacyRequest, PrivacyRequestKind } from "./legal.types";

function secureStoreKey(prefix: string, phone: string) {
  const accountKey = phone.replace(/[^a-zA-Z0-9._-]/g, "-") || "anonymous";
  return `${prefix}.${accountKey}`;
}

const acceptanceKey = (phone: string) =>
  secureStoreKey("organic-legal-acceptances", phone);
const privacyRequestKey = (phone: string) =>
  secureStoreKey("organic-privacy-requests", phone);

export async function getLegalAcceptances(phone: string) {
  return (await storage.getJSON<LegalAcceptance[]>(acceptanceKey(phone))) ?? [];
}

export async function acceptLegalDocuments(
  phone: string,
  documentIds: readonly LegalDocumentId[],
  source: LegalAcceptanceSource,
) {
  const current = await getLegalAcceptances(phone);
  const acceptedAt = new Date().toISOString();
  const next = documentIds.reduce<LegalAcceptance[]>((items, documentId) => {
    const document = getLegalDocument(documentId);
    if (!document) return items;
    return [
      ...items.filter((item) => item.documentId !== documentId),
      { documentId, version: document.version, acceptedAt, source },
    ];
  }, current);
  await storage.setJSON(acceptanceKey(phone), next);
  return next;
}

export async function getPrivacyRequests(phone: string) {
  return (await storage.getJSON<PrivacyRequest[]>(privacyRequestKey(phone))) ?? [];
}

export async function createPrivacyRequest(phone: string, kind: PrivacyRequestKind, note: string) {
  const request: PrivacyRequest = {
    id: `privacy-${Date.now()}`,
    kind,
    note: note.trim(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const current = await getPrivacyRequests(phone);
  await storage.setJSON(privacyRequestKey(phone), [request, ...current]);
  return request;
}
