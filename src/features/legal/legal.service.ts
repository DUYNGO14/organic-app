import { storage } from "@/lib/storage";
import type { AuthSession } from "@/types/user";
import { getLegalDocument } from "./legal.data";
import type { LegalAcceptance, LegalAcceptanceSource, LegalDocumentId, PrivacyRequest, PrivacyRequestKind } from "./legal.types";

export function getLegalAccount(session: AuthSession | null) {
  return session?.userData?.email || session?.phone;
}

function secureStoreKey(prefix: string, account: string) {
  const accountKey = account.includes("@")
    ? `email.${Array.from(account.toLowerCase(), (character) =>
        /^[a-z0-9-]$/.test(character) ? character : `.${character.codePointAt(0)?.toString(16)}.`,
      ).join("")}`
    : account.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${prefix}.${accountKey}`;
}

const acceptanceKey = (account: string) =>
  secureStoreKey("organic-legal-acceptances", account);
const privacyRequestKey = (account: string) =>
  secureStoreKey("organic-privacy-requests", account);

export async function getLegalAcceptances(account: string) {
  return (await storage.getJSON<LegalAcceptance[]>(acceptanceKey(account))) ?? [];
}

export async function acceptLegalDocuments(
  account: string,
  documentIds: readonly LegalDocumentId[],
  source: LegalAcceptanceSource,
) {
  const current = await getLegalAcceptances(account);
  const acceptedAt = new Date().toISOString();
  const next = documentIds.reduce<LegalAcceptance[]>((items, documentId) => {
    const document = getLegalDocument(documentId);
    if (!document) return items;
    return [
      ...items.filter((item) => item.documentId !== documentId),
      { documentId, version: document.version, acceptedAt, source },
    ];
  }, current);
  await storage.setJSON(acceptanceKey(account), next);
  return next;
}

export async function getPrivacyRequests(account: string) {
  return (await storage.getJSON<PrivacyRequest[]>(privacyRequestKey(account))) ?? [];
}

export async function createPrivacyRequest(account: string, kind: PrivacyRequestKind, note: string) {
  const request: PrivacyRequest = {
    id: `privacy-${Date.now()}`,
    kind,
    note: note.trim(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const current = await getPrivacyRequests(account);
  await storage.setJSON(privacyRequestKey(account), [request, ...current]);
  return request;
}
