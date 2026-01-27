const hits = new Map()

export const rateLimit = (req, res, next) => {
  const key = req.ip
  const now = Date.now()
  const windowMs = 60 * 1000
  const max = 100

  const entry = hits.get(key) || { count: 0, time: now }

  if (now - entry.time > windowMs) {
    hits.set(key, { count: 1, time: now })
    return next()
  }

  if (entry.count >= max) {
    return res.status(429).json({ message: 'Too many requests' })
  }

  entry.count += 1
  hits.set(key, entry)
  next()
}
