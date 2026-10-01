import { useCallback, useEffect, useRef, useState } from "react";
import { getDiscovery } from "../api/discovery";
import type { FxService } from "../mapper/discovery";
export function useDiscovery() {
  const [services, setServices] = useState<FxService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);
  const active = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const next = await getDiscovery(controller.signal);
      if (active.current !== controller) return;
      setServices(next);
      setUpdated(new Date());
      setError(null);
    } catch (reason) {
      if (active.current !== controller) return;
      setError(
        controller.signal.aborted
          ? "Discovery request timed out"
          : reason instanceof Error
            ? reason.message
            : "Unable to reach fxcontrol",
      );
    } finally {
      window.clearTimeout(timeout);
      if (active.current === controller) setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Initial discovery synchronizes with the external controller; loading is already true.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 30000);
    return () => {
      window.clearInterval(interval);
      const controller = active.current;
      active.current = null;
      controller?.abort();
    };
  }, [refresh]);
  return { services, loading, error, updated, refresh };
}
