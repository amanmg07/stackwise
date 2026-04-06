import { File, Directory, Paths } from "expo-file-system";

/**
 * Copy a picked image (cache URI) into the app's documents directory so it persists.
 * Returns the new file:// URI of the saved image.
 */
export function saveScanImage(sourceUri: string, id: string): string {
  const scansDir = new Directory(Paths.document, "scans");
  scansDir.create({ intermediates: true, idempotent: true });
  // Preserve extension if present, default to jpg
  const extMatch = sourceUri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
  const dest = new File(scansDir, `${id}.${ext}`);
  const src = new File(sourceUri);
  src.copy(dest);
  return dest.uri;
}
