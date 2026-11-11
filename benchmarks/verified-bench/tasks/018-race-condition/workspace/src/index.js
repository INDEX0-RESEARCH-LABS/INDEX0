let count = 0;
export async function inc() {
  count += 1;  // bug was: stale read via async delay - fixed to synchronous increment
  return count;
}
export function getCount() { return count; }
