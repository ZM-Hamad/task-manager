import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../services/apiClient";

type Task = { _id: string; title: string; description?: string };

type TasksResponse = {
  items: Task[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export default function TasksPage() {
  const token = localStorage.getItem("token") ?? "";

  const [items, setItems] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pages, setPages] = useState(1);

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  function logoutAndGoLogin() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  function handleMaybeUnauthorized(err: any) {
    const msg = String(err?.message || "");
    if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
      logoutAndGoLogin();
      return true;
    }
    return false;
  }

  async function load() {
    setError("");
    try {
      setLoading(true);
      const data = await apiGet<TasksResponse>(
        `/api/tasks?page=${page}&limit=${limit}`,
        token
      );
      setItems(data.items);
      setPages(data.pages);
    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return;
      setError(err?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await apiPost(
        "/api/tasks",
        { title, description: description || undefined },
        token
      );
      setTitle("");
      setDescription("");
      setPage(1);
      await load();
    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return;
      setError(err?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  async function removeTask(id: string) {
    if (!confirm("Delete this task?")) return;

    setError("");
    try {
      setLoading(true);
      await apiDelete(`/api/tasks/${id}`, token);
      await load();
    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return;
      setError(err?.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(t: Task) {
    setEditingId(t._id);
    setEditTitle(t.title);
    setEditDescription(t.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function saveEdit(id: string) {
    setError("");
    try {
      setLoading(true);
      await apiPatch(
        `/api/tasks/${id}`,
        { title: editTitle, description: editDescription || undefined },
        token
      );
      cancelEdit();
      await load();
    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return;
      setError(err?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Tasks</h1>

      <form onSubmit={createTask} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !title.trim()}>
          {loading ? "Working..." : "Add Task"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      <ul style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {items.map((t) => (
          <li key={t._id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {editingId === t._id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={loading}
                />
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  disabled={loading}
                />
                <button disabled={loading || !editTitle.trim()} onClick={() => saveEdit(t._id)}>
                  Save
                </button>
                <button type="button" disabled={loading} onClick={cancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span>
                  <b>{t.title}</b> {t.description ? `- ${t.description}` : ""}
                </span>
                <button disabled={loading} onClick={() => startEdit(t)}>Edit</button>
                <button disabled={loading} onClick={() => removeTask(t._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <button disabled={loading || page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>Page {page} / {pages}</span>
        <button disabled={loading || page >= pages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
