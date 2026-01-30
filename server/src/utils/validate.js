export const isEmail = (v) => {
  const s = String(v || '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export const isNonEmptyString = (v, min = 1, max = 200) => {
  if (typeof v !== 'string') return false
  const s = v.trim()
  return s.length >= min && s.length <= max
}

export const toDateOrNull = (v) => {
  if (v == null || v === '') return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}


export const normalizeEmail = (v) => String(v || '').trim().toLowerCase()

export const validateRegister = ({ name, email, password }) => {
  const errors = {}
  if (!isNonEmptyString(name, 1, 120)) errors.name = 'Name is required'
  if (!isEmail(email)) errors.email = 'Invalid email'
  if (!isNonEmptyString(password, 6, 200)) errors.password = 'Password must be at least 6 characters'
  return { ok: Object.keys(errors).length === 0, errors }
}

export const validateLogin = ({ email, password }) => {
  const errors = {}
  if (!isEmail(email)) errors.email = 'Invalid email'
  if (!isNonEmptyString(password, 1, 200)) errors.password = 'Password is required'
  return { ok: Object.keys(errors).length === 0, errors }
}

export const validateCreateTask = ({ title, description, category, dueAt }) => {
  const errors = {}
  if (!isNonEmptyString(title, 1, 120)) errors.title = 'Title is required'
  if (description != null && typeof description !== 'string') errors.description = 'Description must be a string'
  if (category != null && !isNonEmptyString(category, 1, 120)) errors.category = 'Category is required'
  if (dueAt !== undefined) {
    const d = toDateOrNull(dueAt)
    if (d === null) errors.dueAt = 'Invalid due date/time'
  }

  return { ok: Object.keys(errors).length === 0, errors }
}

export const validateUpdateTask = ({ title, description, status, category, dueAt, archived }) => {
  const errors = {}
  if (archived !== undefined && typeof archived !== "boolean") errors.archived = "Invalid archived flag"
  if (title !== undefined && !isNonEmptyString(title, 1, 120)) errors.title = 'Invalid title'
  if (description !== undefined && typeof description !== 'string') errors.description = 'Description must be a string'
  if (status !== undefined && !['active', 'done'].includes(status)) errors.status = 'Invalid status'
  if (category !== undefined && !isNonEmptyString(category, 1, 120)) errors.category = 'Invalid category'
  if (archived !== undefined && typeof archived !== 'boolean') errors.archived = 'Invalid archived flag'
  if (dueAt !== undefined) {
    const d = toDateOrNull(dueAt)
    if (d === null) errors.dueAt = 'Invalid due date/time'
  }
  return { ok: Object.keys(errors).length === 0, errors }
}
