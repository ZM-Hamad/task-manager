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

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  async function load() {
    setError("");
    try {
      setLoading(true);
      const data = await apiGet<TasksResponse>("/api/tasks", token);
      setItems(data.items);
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await apiPost("/api/tasks", { title, description: description || undefined }, token);
      setTitle("");
      setDescription("");
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to create task");
    }
  }

  async function removeTask(id: string) {
    setError("");
    try {
      await apiDelete(`/api/tasks/${id}`, token);
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to delete task");
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
      await apiPatch(`/api/tasks/${id}`, {
        title: editTitle,
        description: editDescription || undefined,
      }, token);

      cancelEdit();
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to update task");
    }
  }

  return (
    <div>
      <h1>Tasks</h1>

      <form onSubmit={createTask} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      <ul style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {items.map((t) => (
          <li key={t._id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {editingId === t._id ? (
              <>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                />
                <button onClick={() => saveEdit(t._id)}>Save</button>
                <button type="button" onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <span>
                  <b>{t.title}</b> {t.description ? `- ${t.description}` : ""}
                </span>
                <button onClick={() => startEdit(t)}>Edit</button>
                <button onClick={() => removeTask(t._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
