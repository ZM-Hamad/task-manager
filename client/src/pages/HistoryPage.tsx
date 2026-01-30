import { useEffect, useMemo, useState } from "react"
import { apiDelete, apiGet } from "../services/apiClient"
import { useLocalStorage } from "../hooks/useLocalStorage"

import "./ui.css"
import "./tasks.css"

type Task = {
  _id: string
  title: string
  description?: string
  category?: string
  dueAt?: string | null
  status?: "active" | "done"
  archived?: boolean
}

type TasksResponse = {
  items: Task[]
  page: number
  limit: number
  total: number
  pages: number
}

export default function HistoryPage() {
  const tokenStorage = useLocalStorage<string>("token", "")
  const token = tokenStorage.value

  const [items, setItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function logoutAndGoLogin() {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  function handleMaybeUnauthorized(err: any) {
    const msg = String(err?.message || "")
    if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
      logoutAndGoLogin()
      return true
    }
    return false
  }

  function getCat(c?: string) {
    const s = String(c || "General").trim()
    return s || "General"
  }

  function fmtDue(dueAt?: string | null) {
    if (!dueAt) return ""
    const d = new Date(dueAt)
    if (Number.isNaN(d.getTime())) return ""
    return d.toLocaleString()
  }

  function dueMs(dueAt?: string | null) {
    if (!dueAt) return Number.NEGATIVE_INFINITY
    const d = new Date(dueAt)
    const t = d.getTime()
    return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t
  }

  async function load() {
    setError("")
    try {
      setLoading(true)
      const data = await apiGet<TasksResponse>("/api/tasks", token)
      setItems(data.items || [])
    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return
      setError(err?.message || "Failed to load history")
    } finally {
      setLoading(false)
    }
  }


  async function clearHistory() {
  if (!confirm("Delete all completed tasks?")) return
  setError("")
  try {
    setLoading(true)
    await apiDelete("/api/tasks/history", token)
    await load()
  } catch (err: any) {
    if (handleMaybeUnauthorized(err)) return
    setError(err?.message || "Failed to clear history")
  } finally {
    setLoading(false)
  }
}



  useEffect(() => {
    if (token) load()
  }, [token])

  const doneTasks = useMemo(() => {
    return items
      .filter((t) => (t.status || "active") === "done")
      .slice()
      .sort((a, b) => dueMs(b.dueAt) - dueMs(a.dueAt)) // latest first
  }, [items])

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1 className="tasks-title">History</h1>
        <p className="tasks-subtitle">Completed tasks</p>
      </div>

      <div className="main-content">
        {error && <p className="msg msg--error">{error}</p>}
        {loading && <p className="msg">Loading...</p>}

        <div className="all-tasks" style={{ maxWidth: 720 }}>
          <div className="all-tasks-head">
            <span>Done tasks ({doneTasks.length})</span>
            <button
  className="btn btn--ghost"
  type="button"
  disabled={loading || doneTasks.length === 0}
  onClick={clearHistory}
>
  Clear history
</button>

          </div>

          <ul className="all-tasks-list">
            {doneTasks.map((t) => (
              <li className="all-task-row is-done" key={t._id}>
                <div className="all-task-main">
                  <div className="all-task-top">
                    <span className="pill">{getCat(t.category)}</span>
                    <span className="all-task-title">{t.title}</span>
                  </div>

                  <div className="all-task-meta">
                    <span className="all-task-date">{fmtDue(t.dueAt)}</span>
                    <span className="all-task-status done">Done</span>
                  </div>

                  {t.description ? (
                    <div className="muted" style={{ marginTop: 6 }}>
                      {t.description}
                    </div>
                  ) : null}
                </div>


                
              </li>
            ))}

            {(!loading && doneTasks.length === 0) ? (
              <li className="muted" style={{ padding: 12 }}>
                No completed tasks yet.
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  )
}
