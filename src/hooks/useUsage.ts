import { useCallback, useEffect, useState } from "react";
import { checkLimit, LimitedFeature } from "../services/usageLimits";

interface UsageInfo {
  remaining: number;
  limit: number;
  loaded: boolean;
  /** Re-read from storage. Call after trackUsage to keep the UI in sync. */
  refresh: () => Promise<void>;
}

export function useUsage(feature: LimitedFeature): UsageInfo {
  const [remaining, setRemaining] = useState(0);
  const [limit, setLimit] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const r = await checkLimit(feature);
    setRemaining(r.remaining);
    setLimit(r.limit);
    setLoaded(true);
  }, [feature]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { remaining, limit, loaded, refresh };
}
