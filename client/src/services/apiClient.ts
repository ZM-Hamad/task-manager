const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function parseError(res: Response) {
  try {
    const data = await res.json();
    return data?.message || JSON.stringify(data);
  } catch {
    return await res.text();
  }
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}
