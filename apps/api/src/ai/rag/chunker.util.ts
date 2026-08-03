// Naive fixed-size chunking with overlap. Character-based rather than
// token-based to avoid pulling in a tokenizer just for this — ~800 chars
// with 100 char overlap works well for all-MiniLM-L6-v2's 256-token window.
export function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  if (clean.length <= chunkSize) return [clean];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - overlap;
  }
  return chunks;
}