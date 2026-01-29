import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../services/apiClient";
import { useLocalStorage } from "../hooks/useLocalStorage";

import "./ui.css"
import "./tasks.css"



type Task = { _id: string; title: string; description?: string; category?: string; dueAt?: string | null };

type TasksResponse = {
  items: Task[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export default function TasksPage() {
  const tokenStorage = useLocalStorage<string>("token", "");
  const token = tokenStorage.value;

  const [items, setItems] = useState<Task[]>([]);

  const [newCategory, setNewCategory] = useState("")
  const [extraCategories, setExtraCategories] = useState<string[]>([])


  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [who, setWho] = useState("")





  const [menuOpenTaskId, setMenuOpenTaskId] = useState<string | null>(null)
  const [editOpenTask, setEditOpenTask] = useState<Task | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState("")
  const [editTaskDescription, setEditTaskDescription] = useState("")
  const [editTaskDate, setEditTaskDate] = useState("")
  const [editTaskTime, setEditTaskTime] = useState("")


  const [menuOpenCat, setMenuOpenCat] = useState<string | null>(null)
  const [renamingCat, setRenamingCat] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [selectModeCats, setSelectModeCats] = useState<Record<string, boolean>>({})
  const [selectedByCat, setSelectedByCat] = useState<Record<string, Record<string, boolean>>>({})



  const [addOpenCat, setAddOpenCat] = useState<string | null>(null)
  const [addTitle, setAddTitle] = useState("")
  const [addDescription, setAddDescription] = useState("")
  const [addDate, setAddDate] = useState("")
  const [addTime, setAddTime] = useState("")


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


  function displayNameFromEmail(email: string) {
    const s = String(email || "").trim()
    if (!s) return "there"
    return s.includes("@") ? s.split("@")[0] : s
  }

  function timeGreeting() {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  }


  async function load() {
    setError("");
    try {
      setLoading(true);
      const data = await apiGet<TasksResponse>(
        `/api/tasks`,
        token
      );
      setItems(data.items);
      try {
        const me = await apiGet<{ email?: string }>("/api/auth/me", token)
        setWho(displayNameFromEmail(me?.email || ""))
      } catch { }

    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return;
      setError(err?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
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
    if (!dueAt) return Number.POSITIVE_INFINITY
    const d = new Date(dueAt)
    const t = d.getTime()
    return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t
  }


  function splitDue(dueAt?: string | null) {
    if (!dueAt) return { date: "", time: "" }
    const d = new Date(dueAt)
    if (Number.isNaN(d.getTime())) return { date: "", time: "" }
    const iso = d.toISOString()
    return { date: iso.slice(0, 10), time: iso.slice(11, 16) }
  }


  function isSelectMode(cat: string) {
    return Boolean(selectModeCats[cat])
  }

  function toggleSelectMode(cat: string) {
    setSelectModeCats((prev) => ({ ...prev, [cat]: !prev[cat] }))
    setSelectedByCat((prev) => ({ ...prev, [cat]: {} }))
  }



  async function deleteSelected(cat: string) {
    const sel = selectedByCat[cat] || {}
    const ids = Object.keys(sel).filter((id) => sel[id])
    if (ids.length === 0) return

    if (!confirm(`Delete ${ids.length} tasks?`)) return

    setError("")
    try {
      setLoading(true)
      await Promise.all(ids.map((id) => apiDelete(`/api/tasks/${id}`, token)))
      setSelectedByCat((prev) => ({ ...prev, [cat]: {} }))
      await load()
    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return
      setError(err?.message || "Failed to delete selected tasks")
    } finally {
      setLoading(false)
    }
  }

  function openRename(cat: string) {
    setMenuOpenCat(null)
    setRenamingCat(cat)
    setRenameValue(cat)
  }

  async function saveRename(oldCat: string) {
    const nextCat = renameValue.trim()
    if (!nextCat || nextCat === oldCat) {
      setRenamingCat(null)
      setRenameValue("")
      return
    }

    const catItems = items.filter((t) => getCat(t.category) === oldCat)

    setError("")
    try {
      setLoading(true)
      await Promise.all(catItems.map((t) => apiPatch(`/api/tasks/${t._id}`, { category: nextCat }, token)))

      setExtraCategories((prev) => prev.map((c) => (c === oldCat ? nextCat : c)))



      setSelectModeCats((prev) => {
        const copy = { ...prev }
        if (copy[oldCat] !== undefined) {
          copy[nextCat] = copy[oldCat]
          delete copy[oldCat]
        }
        return copy
      })

      setSelectedByCat((prev) => {
        const copy = { ...prev }
        if (copy[oldCat] !== undefined) {
          copy[nextCat] = copy[oldCat]
          delete copy[oldCat]
        }
        return copy
      })

      setRenamingCat(null)
      setRenameValue("")
      await load()
    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return
      setError(err?.message || "Failed to rename category")
    } finally {
      setLoading(false)
    }
  }



  async function deleteCategory(cat: string) {
    setMenuOpenCat(null)
    const catItems = items.filter((t) => getCat(t.category) === cat)
    if (!confirm(`Delete category "${cat}" and ${catItems.length} tasks?`)) return

    setError("")
    try {
      setLoading(true)
      await Promise.all(catItems.map((t) => apiDelete(`/api/tasks/${t._id}`, token)))
      setExtraCategories((prev) => prev.filter((c) => c !== cat))

      setSelectModeCats((prev) => {
        const copy = { ...prev }
        delete copy[cat]
        return copy
      })
      setSelectedByCat((prev) => {
        const copy = { ...prev }
        delete copy[cat]
        return copy
      })
      await load()
    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return
      setError(err?.message || "Failed to delete category")
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    load();
  }, []);


  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as HTMLElement | null
      if (!t) return
      if (t.closest(".kebab")) return
      setMenuOpenCat(null)
      setMenuOpenTaskId(null)

    }

    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])



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





  async function submitAddTask() {
    if (!addOpenCat) return

    const cleanTitle = addTitle.trim()
    const cleanDesc = addDescription.trim()
    const cleanDate = addDate.trim()
    const cleanTime = addTime.trim()

    if (!cleanTitle) {
      setError("Title is required")
      return
    }
    if (!cleanDate || !cleanTime) {
      setError("Date and time are required")
      return
    }

    setError("")
    try {
      setLoading(true)
      await apiPost(
        "/api/tasks",
        {
          title: cleanTitle,
          description: cleanDesc || undefined,
          category: addOpenCat,
          dueAt: new Date(`${cleanDate}T${cleanTime}`).toISOString()

        },
        token
      )
      setAddOpenCat(null)
      await load()
    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return
      setError(err?.message || "Failed to create task")
    } finally {
      setLoading(false)
    }
  }


  function openEditTask(t: Task) {
    setMenuOpenTaskId(null)
    setEditOpenTask(t)
    setEditTaskTitle(t.title || "")
    setEditTaskDescription(t.description || "")
    const p = splitDue(t.dueAt ?? null)
    setEditTaskDate(p.date)
    setEditTaskTime(p.time)
  }

  async function submitEditTask() {
    if (!editOpenTask) return

    const cleanTitle = editTaskTitle.trim()
    const cleanDesc = editTaskDescription.trim()
    const cleanDate = editTaskDate.trim()
    const cleanTime = editTaskTime.trim()

    if (!cleanTitle) {
      setError("Title is required")
      return
    }
    if (!cleanDate || !cleanTime) {
      setError("Date and time are required")
      return
    }

    setError("")
    try {
      setLoading(true)
      await apiPatch(
        `/api/tasks/${editOpenTask._id}`,
        {
          title: cleanTitle,
          description: cleanDesc || "",
          dueAt: new Date(`${cleanDate}T${cleanTime}`).toISOString()
        },
        token
      )
      setEditOpenTask(null)
      await load()
    } catch (err: any) {
      if (handleMaybeUnauthorized(err)) return
      setError(err?.message || "Failed to update task")
    } finally {
      setLoading(false)
    }
  }


  const derivedCategories = Array.from(new Set(items.map((t) => getCat(t.category))))
  const categories = Array.from(new Set(["General", ...derivedCategories, ...extraCategories]))


  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1 className="tasks-title">Hi {who || "there"},</h1>
        <p className="tasks-subtitle">{timeGreeting()}</p>

        <div className="left-add-category">
          <input
            className="field"
            placeholder="New category (e.g. Home)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={loading}
          />
          <button
            className="btn btn--primary"
            type="button"
            disabled={loading}
            onClick={() => {
              const c = newCategory.trim()
              if (!c) return
              setExtraCategories((prev) => (prev.includes(c) ? prev : [...prev, c]))
              setNewCategory("")
            }}
          >
            Add Category
          </button>
        </div>
      </div>


      <div className="main-content">
        

        {error && <p className="msg msg--error">{error}</p>}
        {loading && <p className="msg">Loading...</p>}

        <div className="boards">
          {categories.map((cat) => {
            const catItems = items
              .filter((t) => getCat(t.category) === cat)
              .slice()
              .sort((a, b) => dueMs(a.dueAt) - dueMs(b.dueAt))


            return (
              <section className="board" key={cat}>
                <div className="board-head">
                  <h2 className="board-title">{cat}</h2>

                  <div className="kebab">
                    <button
                      type="button"
                      className="kebab-btn"
                      disabled={loading}
                      onClick={() => setMenuOpenCat((prev) => (prev === cat ? null : cat))}
                    >
                      ⋯
                    </button>

                    {menuOpenCat === cat ? (
                      <div className="kebab-menu">
                        <button type="button" className="kebab-item" onClick={() => openRename(cat)}>Edit category</button>
                        <button type="button" className="kebab-item" onClick={() => {
                          setMenuOpenCat(null)
                          setAddOpenCat(cat)
                          setAddTitle("")
                          setAddDescription("")
                          setAddDate("")
                          setAddTime("")
                        }}
                        >Add task</button>
                        <button type="button" className="kebab-item" onClick={() => { setMenuOpenCat(null); toggleSelectMode(cat) }}>
                          {isSelectMode(cat) ? "Stop selecting" : "Select tasks"}
                        </button>
                        <button type="button" className="kebab-item kebab-danger" onClick={() => deleteCategory(cat)}>Delete category</button>
                      </div>
                    ) : null}
                  </div>
                </div>
                {renamingCat === cat ? (
                  <div className="rename-bar">
                    <input
                      className="field"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      disabled={loading}
                    />
                    <button className="btn btn--primary" type="button" disabled={loading || !renameValue.trim()} onClick={() => saveRename(cat)}>
                      Save
                    </button>
                    <button className="btn btn--ghost" type="button" disabled={loading} onClick={() => { setRenamingCat(null); setRenameValue("") }}>
                      Cancel
                    </button>
                  </div>
                ) : null}



                <ul className="tasks-list">
                  {catItems.map((t) => (
                    <li className="task-row" key={t._id}>
                      <div className="task-main">
                        <div className="task-text">
                          <b>{t.title}</b>
                          {t.description ? <span className="muted"> — {t.description}</span> : null}
                        </div>

                        {t.dueAt ? <div className="task-due">{fmtDue(t.dueAt)}</div> : null}
                      </div>

                      <div className="kebab task-kebab">
                        <button
                          type="button"
                          className="kebab-btn"
                          disabled={loading}
                          onClick={() => setMenuOpenTaskId((prev) => (prev === t._id ? null : t._id))}
                        >
                          ⋯
                        </button>

                        {menuOpenTaskId === t._id ? (
                          <div className="kebab-menu">
                            <button type="button" className="kebab-item" onClick={() => openEditTask(t)}>Edit</button>
                            <button type="button" className="kebab-item kebab-danger" onClick={() => removeTask(t._id)}>Delete</button>
                          </div>
                        ) : null}
                      </div>
                    </li>

                  ))}
                </ul>
                {isSelectMode(cat) ? (
                  <div className="bulk-bar">
                    <button className="btn btn--ghost" type="button" disabled={loading} onClick={() => deleteSelected(cat)}>
                      Delete selected
                    </button>
                  </div>
                ) : null}

              </section>
            )
          })}
        </div>
      </div>
      {addOpenCat ? (
        <div className="modal-overlay" onMouseDown={() => setAddOpenCat(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">Add Task — {addOpenCat}</div>
              <button className="kebab-btn" type="button" disabled={loading} onClick={() => setAddOpenCat(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <input
                className="field"
                placeholder="Title"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                disabled={loading}
              />

              <input
                className="field"
                placeholder="Description (optional)"
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                disabled={loading}
              />

              <div className="modal-row">
                <input
                  className="field"
                  type="date"
                  value={addDate}
                  onChange={(e) => setAddDate(e.target.value)}
                  disabled={loading}
                />
                <input
                  className="field"
                  type="time"
                  value={addTime}
                  onChange={(e) => setAddTime(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn--ghost" type="button" disabled={loading} onClick={() => setAddOpenCat(null)}>
                Cancel
              </button>
              <button className="btn btn--primary" type="button" disabled={loading} onClick={submitAddTask}>
                {loading ? "Working..." : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {editOpenTask ? (
        <div className="modal-overlay" onMouseDown={() => setEditOpenTask(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">Edit Task</div>
              <button className="kebab-btn" type="button" disabled={loading} onClick={() => setEditOpenTask(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <input
                className="field"
                placeholder="Title"
                value={editTaskTitle}
                onChange={(e) => setEditTaskTitle(e.target.value)}
                disabled={loading}
              />

              <input
                className="field"
                placeholder="Description (optional)"
                value={editTaskDescription}
                onChange={(e) => setEditTaskDescription(e.target.value)}
                disabled={loading}
              />

              <div className="modal-row">
                <input
                  className="field"
                  type="date"
                  value={editTaskDate}
                  onChange={(e) => setEditTaskDate(e.target.value)}
                  disabled={loading}
                />
                <input
                  className="field"
                  type="time"
                  value={editTaskTime}
                  onChange={(e) => setEditTaskTime(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn--ghost" type="button" disabled={loading} onClick={() => setEditOpenTask(null)}>
                Cancel
              </button>
              <button className="btn btn--primary" type="button" disabled={loading} onClick={submitEditTask}>
                {loading ? "Working..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}



    </div>
  )

}
