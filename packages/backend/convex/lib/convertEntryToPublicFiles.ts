import { Entry, EntryId } from '@convex-dev/rag';
import { QueryCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';

export type PublicFile = {
  id: EntryId;
  name: string;
  type: string;
  size: string;
  status: 'ready' | 'processing' | 'error';
  url: string | null;
  category?: string;
};

export type EntryMetadata = {
  storageId: Id<'_storage'>;
  uploadedBy: string;
  filename: string;
  category: string | null;
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function convertEntryToPublicFiles(
  ctx: QueryCtx,
  entry: Entry
): Promise<PublicFile> {
  const metadata = entry.metadata as EntryMetadata | undefined;
  const storageId = metadata?.storageId;

  let fileSize = 'unknown';

  if (storageId) {
    try {
      const storageMetadata = await ctx.db.system.get(storageId);
      if (storageMetadata) {
        fileSize = formatFileSize(storageMetadata.size);
      }
    } catch (error) {
      console.error('Error fetching storage metadata:', error);
    }
  }

  const filename = entry.key || 'unknown';
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  let status: 'ready' | 'processing' | 'error' = 'error';

  if (entry.status === 'ready') status = 'ready';
  else if (entry.status === 'pending') status = 'processing';

  const url = storageId ? await ctx.storage.getUrl(storageId) : null;
  return {
    id: entry.entryId,
    name: filename,
    type: extension,
    size: fileSize,
    status,
    url,
    category: metadata?.category || undefined,
  };
}
