import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useImpactRecords, useSwedishGoalies, useSwedishPlayers } from '@/hooks/useNHLData';
import { CURRENT_SEASON } from '@/lib/season';
import { RecordSnapshot, recordSnapshot } from '@/lib/records';

// Badges for Records entries that changed since this visitor last looked, kept in their browser only.
// "nav" is what the list looked like when they last opened the Records page (the badge on the Records tab),
// "entries" is each entry as they last hovered it (the badges on lists and entries).
// A first-time visitor gets both set to what's there now, so they see no badges.
interface SeenState {
  season: string;
  nav: RecordSnapshot;
  entries: RecordSnapshot;
}

const STORAGE_KEY = 'svenhl-records-seen';

const read = (): SeenState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

let state = read();
const listeners = new Set<() => void>();

const write = (next: SeenState) => {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or full storage: badges still clear for this visit
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Keep other open tabs in step
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    state = read();
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

const getState = () => state;

// Lists the visitor hasn't seen at all (a new list, or a new season) start out as seen
const withMissingLists = (base: RecordSnapshot, current: RecordSnapshot) => {
  const missing = Object.keys(current).filter((list) => !(list in base));
  return missing.length ? { ...base, ...Object.fromEntries(missing.map((list) => [list, current[list]])) } : base;
};

// The entry is in the list now and wasn't there, or had another value, when last seen
const changed = (base: RecordSnapshot | undefined, current: RecordSnapshot, list: string, id: string) =>
  !!base?.[list] && id in (current[list] ?? {}) && base[list][id] !== current[list][id];

// Only the current season's lists get badges
export const useRecordUpdates = () => {
  const { data: players } = useSwedishPlayers(CURRENT_SEASON);
  const { data: goalies } = useSwedishGoalies(CURRENT_SEASON);
  const { data: impactGames } = useImpactRecords(CURRENT_SEASON);
  const seen = useSyncExternalStore(subscribe, getState);

  const current = useMemo(
    () => (players && goalies && impactGames ? recordSnapshot(players, goalies, impactGames) : null),
    [players, goalies, impactGames],
  );

  useEffect(() => {
    if (!current) return;
    if (!seen || seen.season !== CURRENT_SEASON) {
      write({ season: CURRENT_SEASON, nav: current, entries: current });
      return;
    }
    const nav = withMissingLists(seen.nav, current);
    const entries = withMissingLists(seen.entries, current);
    if (nav !== seen.nav || entries !== seen.entries) write({ ...seen, nav, entries });
  }, [current, seen]);

  const valid = current && seen?.season === CURRENT_SEASON ? seen : null;

  const isUpdated = useCallback(
    (list: string, id: string) => !!current && changed(valid?.entries, current, list, id),
    [current, valid],
  );

  const listHasUpdate = useCallback(
    (list: string) => !!current && Object.keys(current[list] ?? {}).some((id) => isUpdated(list, id)),
    [current, isUpdated],
  );

  const navHasUpdate =
    !!current &&
    Object.entries(current).some(([list, ids]) => Object.keys(ids).some((id) => changed(valid?.nav, current, list, id)));

  const markSeen = useCallback(
    (list: string, id: string) => {
      if (!current || !valid || !isUpdated(list, id)) return;
      write({ ...valid, entries: { ...valid.entries, [list]: { ...valid.entries[list], [id]: current[list][id] } } });
    },
    [current, valid, isUpdated],
  );

  const markNavSeen = useCallback(() => {
    if (current && valid && navHasUpdate) write({ ...valid, nav: current });
  }, [current, valid, navHasUpdate]);

  return { isUpdated, listHasUpdate, navHasUpdate, markSeen, markNavSeen };
};

// How long an updated entry must stay fully on screen on a touch device before it counts as seen
const TOUCH_SEEN_DELAY = 1500;

// Calls onSeen when the visitor hovers or focuses the element, or, on touch screens (no hover),
// once it has been fully in view for a moment. Does nothing unless the entry is updated.
export const useSeenOnHover = <T extends HTMLElement>(updated: boolean, onSeen: () => void) => {
  const ref = useRef<T>(null);
  const onSeenRef = useRef(onSeen);
  onSeenRef.current = onSeen;

  useEffect(() => {
    const element = ref.current;
    if (!updated || !element || !window.matchMedia?.('(hover: none)').matches || !('IntersectionObserver' in window)) return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting) timer = window.setTimeout(() => onSeenRef.current(), TOUCH_SEEN_DELAY);
      },
      { threshold: 1 },
    );
    observer.observe(element);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [updated]);

  const handlers = updated ? { onMouseEnter: onSeen, onFocus: onSeen, onClick: onSeen } : {};
  return { ref, ...handlers };
};
