import { useEffect, useState } from "react";

const LOCAL_STORAGE_EVENT = "local-storage";

function notifyLocalStorageChange(key: string) {
  window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_EVENT, { detail: { key } }));
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = () => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState<T>(readValue);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(readValue());
    };

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (!detail?.key || detail.key === key) setValue(readValue());
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCAL_STORAGE_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCAL_STORAGE_EVENT, onCustom);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function setStoredValue(newValue: T) {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
    notifyLocalStorageChange(key);
  }

  function remove() {
    setValue(initialValue);
    localStorage.removeItem(key);
    notifyLocalStorageChange(key);
  }

  return { value, setStoredValue, remove };
}
