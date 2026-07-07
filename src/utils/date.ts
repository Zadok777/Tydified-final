// Small date helpers so screens never import a date library for the few labels
// Tydified needs. All inputs are ISO-ish strings from Supabase (date or
// timestamptz); all outputs are display strings.

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// Turns a `due_date` (YYYY-MM-DD) into a friendly label: Today / Tomorrow /
// Yesterday / "Mon May 28". Returns undefined for null/empty so callers can
// omit the field entirely.
export function formatDueLabel(date: string | null | undefined): string | undefined {
  if (date === null || date === undefined || date === '') return undefined;
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return undefined;

  const todayStart = startOfDay(new Date());
  const dueStart = startOfDay(parsed);
  const diffDays = Math.round((dueStart - todayStart) / DAY_MS);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Compact relative time for "submitted 5m ago" style metadata. Falls back to a
// short date for anything older than a week.
export function formatRelativeTime(iso: string | null | undefined): string {
  if (iso === null || iso === undefined || iso === '') return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(then).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
