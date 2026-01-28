import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function setStoredValue(newValue: T) {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  }

  function remove() {
    setValue(initialValue);
    localStorage.removeItem(key);
  }

  return { value, setStoredValue, remove };
}
