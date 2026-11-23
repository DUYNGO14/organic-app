export const legalDocumentIds = [
  "terms",
  "privacy",
  "sale",
  "delivery",
  "returns",
  "ecommerce",
  "rewards",
] as const;

export type LegalDocumentId = (typeof legalDocumentIds)[number];

export type LegalSection = {
  heading: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
};

export type LegalDocument = {
  id: LegalDocumentId;
  title: string;
  shortTitle: string;
  description: string;
  version: string;
  effectiveDate: string;
  sections: readonly LegalSection[];
};

export type LegalAcceptanceSource = "login" | "checkout" | "legal-center";

export type LegalAcceptance = {
  documentId: LegalDocumentId;
  version: string;
  acceptedAt: string;
  source: LegalAcceptanceSource;
};

export type PrivacyRequestKind = "access" | "correct" | "delete" | "other";

export type PrivacyRequest = {
  id: string;
  kind: PrivacyRequestKind;
  note: string;
  createdAt: string;
  status: "pending";
};
