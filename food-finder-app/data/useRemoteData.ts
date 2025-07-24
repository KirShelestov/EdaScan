import { useEffect, useState } from "react";

export function useRemoteData(url: string) {
  const [data, setData] = useState<{ restaurants: any[]; allDishes: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
} 