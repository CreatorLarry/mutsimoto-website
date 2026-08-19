export const filterRequestAttachmentBucket = "enquiry-attachments";

export const filterRequestKinds = ["identify", "cross_reference", "custom"] as const;
export type FilterRequestKind = (typeof filterRequestKinds)[number];

export const filterRequestKindLabels: Record<FilterRequestKind, string> = {
  identify: "Identify or find a filter",
  cross_reference: "Cross-reference a filter",
  custom: "Custom-made filter request",
};

const attachmentMarker = /^\[Customer photo: ([a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp))\]$/m;

export function createAttachmentMarker(path: string): string {
  return `[Customer photo: ${path}]`;
}

export function extractAttachmentPath(message: string): string | null {
  return message.match(attachmentMarker)?.[1] ?? null;
}

export function removeAttachmentMarker(message: string): string {
  return message.replace(attachmentMarker, "").replace(/\n{3,}/g, "\n\n").trim();
}

export function getFilterRequestKind(source: string): FilterRequestKind | null {
  if (!source.startsWith("website:filter_request:")) return null;
  const kind = source.slice("website:filter_request:".length);
  return filterRequestKinds.find((item) => item === kind) ?? null;
}
