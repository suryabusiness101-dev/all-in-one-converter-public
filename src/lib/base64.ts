export function encodeUtf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function decodeBase64ToUtf8(base64: string): string {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

/** Decodes Base64 to raw bytes (not text) — accepts a bare Base64 string or a full `data:` URI. */
export function decodeBase64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const commaIndex = base64.indexOf(',');
  const raw = base64.trimStart().startsWith('data:') && commaIndex !== -1 ? base64.slice(commaIndex + 1) : base64;
  const binary = atob(raw.replace(/\s/g, ''));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** Extracts the MIME type from a `data:<mime>;base64,...` prefix, if present. */
export function extractDataUriMimeType(input: string): string | null {
  const match = input.trimStart().match(/^data:([^;,]+)[;,]/);
  return match ? match[1] : null;
}

interface DetectedFileType {
  extension: string;
  mimeType: string;
}

// Checked in order against the start of the decoded bytes. Covers the binary formats a
// Base64 string is realistically carrying for this tool's use cases (images, PDFs, zip-based
// archives/office docs) — not an exhaustive file-signature database.
const MAGIC_BYTES: Array<DetectedFileType & { signature: number[] }> = [
  { signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], extension: 'png', mimeType: 'image/png' },
  { signature: [0xff, 0xd8, 0xff], extension: 'jpg', mimeType: 'image/jpeg' },
  { signature: [0x47, 0x49, 0x46, 0x38], extension: 'gif', mimeType: 'image/gif' },
  { signature: [0x25, 0x50, 0x44, 0x46], extension: 'pdf', mimeType: 'application/pdf' },
  { signature: [0x50, 0x4b, 0x03, 0x04], extension: 'zip', mimeType: 'application/zip' },
];

/** Sniffs leading magic bytes to guess a file type. Returns null if nothing matches. */
export function detectFileTypeFromBytes(bytes: Uint8Array): DetectedFileType | null {
  for (const { signature, extension, mimeType } of MAGIC_BYTES) {
    if (signature.every((byte, i) => bytes[i] === byte)) {
      return { extension, mimeType };
    }
  }
  return null;
}

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/json': 'json',
  'text/plain': 'txt',
  'text/csv': 'csv',
};

export function mimeTypeToExtension(mimeType: string): string | null {
  return MIME_TO_EXTENSION[mimeType.toLowerCase()] ?? null;
}
