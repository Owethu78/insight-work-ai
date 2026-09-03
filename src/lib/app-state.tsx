import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Stats {
  tasksPlanned: number;
  emailsDrafted: number;
  minutesSaved: number;
}

interface AppState {
  apiKey: string;
  setApiKey: (key: string) => void;
  hasKey: boolean;
  stats: Stats;
  bump: (patch: Partial<Stats>) => void;
  hydrated: boolean;
}

const KEY_STORAGE = "awpa.openai_key";
const STATS_STORAGE = "awpa.stats";

const defaultStats: Stats = { tasksPlanned: 0, emailsDrafted: 0, minutesSaved: 0 };

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState("");
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setApiKeyState(localStorage.getItem(KEY_STORAGE) ?? "");
      const raw = localStorage.getItem(STATS_STORAGE);
      if (raw) setStats({ ...defaultStats, ...(JSON.parse(raw) as Partial<Stats>) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    try {
      if (key) localStorage.setItem(KEY_STORAGE, key);
      else localStorage.removeItem(KEY_STORAGE);
    } catch {
      /* ignore */
    }
  }, []);

  const bump = useCallback((patch: Partial<Stats>) => {
    setStats((prev) => {
      const next: Stats = {
        tasksPlanned: prev.tasksPlanned + (patch.tasksPlanned ?? 0),
        emailsDrafted: prev.emailsDrafted + (patch.emailsDrafted ?? 0),
        minutesSaved: prev.minutesSaved + (patch.minutesSaved ?? 0),
      };
      try {
        localStorage.setItem(STATS_STORAGE, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ apiKey, setApiKey, hasKey: apiKey.trim().length > 0, stats, bump, hydrated }),
    [apiKey, setApiKey, stats, bump, hydrated],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function formatTimeSaved(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
