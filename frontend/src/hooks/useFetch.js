import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

// Tiny data-fetching hook. Pass a client (e.g. interviewApi) to hit another service.
export function useFetch(path, client = api) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await client.get(path));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await client.get(path);
        if (!cancelled) { setData(result); setError(null); }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [path, client]);

  return { data, loading, error, refetch };
}