const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function parseError(res: Response) {
  try {
    const data = await res.json();
    return data?.message || JSON.stringify(data);
  } catch {
    return await res.text();
  }
}

// ---------- POST ----------
export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
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

// ---------- GET ----------
export async function apiGet<T>(
  path: string,
  token?: string
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

// ---------- DELETE ----------
export async function apiDelete(
  path: string,
  token?: string
): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error(await parseError(res));
}


export async function apiPatch<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}



