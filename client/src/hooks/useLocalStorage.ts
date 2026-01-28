import { useEffect, useState } from "react";

export function useLocalStorage(key: string, initialValue = "") {
  const [value, setValue] = useState<string>(() => localStorage.getItem(key) ?? initialValue);

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
