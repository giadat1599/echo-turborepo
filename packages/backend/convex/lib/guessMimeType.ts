import {
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
} from '@convex-dev/rag';

export function guessMimeType(filename: string, bytes: ArrayBuffer): string {
  return (
    guessMimeTypeFromExtension(filename) ||
    guessMimeTypeFromContents(bytes) ||
    'application/octet-stream'
  );
}
