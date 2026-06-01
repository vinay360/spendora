const WEEKDAYS = new Map([
  ["sunday", 0],
  ["sun", 0],
  ["monday", 1],
  ["mon", 1],
  ["tuesday", 2],
  ["tue", 2],
  ["tues", 2],
  ["wednesday", 3],
  ["wed", 3],
  ["thursday", 4],
  ["thu", 4],
  ["thur", 4],
  ["thurs", 4],
  ["friday", 5],
  ["fri", 5],
  ["saturday", 6],
  ["sat", 6],
])

const MONTHS = new Map([
  ["january", 0],
  ["jan", 0],
  ["february", 1],
  ["feb", 1],
  ["march", 2],
  ["mar", 2],
  ["april", 3],
  ["apr", 3],
  ["may", 4],
  ["june", 5],
  ["jun", 5],
  ["july", 6],
  ["jul", 6],
  ["august", 7],
  ["aug", 7],
  ["september", 8],
  ["sep", 8],
  ["sept", 8],
  ["october", 9],
  ["oct", 9],
  ["november", 10],
  ["nov", 10],
  ["december", 11],
  ["dec", 11],
])

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const next = startOfLocalDay(date)
  next.setDate(next.getDate() + days)
  return next
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function buildValidDate(year: number, month: number, day: number) {
  const date = new Date(year, month, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

function normalizeDateText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/g, "$1")
    .replace(/\s+/g, " ")
}

function parseWeekdayDate(text: string, referenceDate: Date) {
  const match = text.match(/^(last|this|next)?\s*([a-z]+)$/)

  if (!match) {
    return undefined
  }

  const modifier = match[1]
  const weekday = WEEKDAYS.get(match[2])

  if (weekday === undefined) {
    return undefined
  }

  const reference = startOfLocalDay(referenceDate)
  const currentWeekday = reference.getDay()
  let offset = weekday - currentWeekday

  if (modifier === "last") {
    offset -= offset >= 0 ? 7 : 0
  } else if (modifier === "next") {
    offset += offset <= 0 ? 7 : 0
  }

  return addDays(reference, offset)
}

function parseMonthDate(text: string, referenceDate: Date) {
  const monthNames = Array.from(MONTHS.keys()).join("|")
  const dayMonthMatch = text.match(
    new RegExp(
      `^(\\d{1,2})(?: of)? (${monthNames})(?: (this year|last year|next year|\\d{4}))?$`
    )
  )
  const monthDayMatch = text.match(
    new RegExp(
      `^(${monthNames}) (\\d{1,2})(?: (this year|last year|next year|\\d{4}))?$`
    )
  )

  const day = dayMonthMatch
    ? Number(dayMonthMatch[1])
    : monthDayMatch
      ? Number(monthDayMatch[2])
      : undefined
  const monthName = dayMonthMatch?.[2] ?? monthDayMatch?.[1]

  if (!day || !monthName) {
    return undefined
  }

  const month = MONTHS.get(monthName)

  if (month === undefined) {
    return undefined
  }

  const yearText = dayMonthMatch?.[3] ?? monthDayMatch?.[3]
  let year = referenceDate.getFullYear()

  if (yearText === "last year") {
    year -= 1
  } else if (yearText === "next year") {
    year += 1
  } else if (yearText && yearText !== "this year") {
    year = Number(yearText)
  }

  return buildValidDate(year, month, day)
}

export function normalizeExpenseDate(
  value: string | undefined,
  referenceDate = new Date()
) {
  if (!value) {
    return undefined
  }

  const text = normalizeDateText(value)

  if (!text) {
    return undefined
  }

  const isoDateMatch = text.match(/^(\d{4}-\d{2}-\d{2})(?:[t ].*)?$/)

  if (isoDateMatch) {
    const [year, month, day] = isoDateMatch[1].split("-").map(Number)
    const date = buildValidDate(year, month - 1, day)
    return date ? toIsoDate(date) : undefined
  }

  if (text === "today") {
    return toIsoDate(referenceDate)
  }

  if (text === "yesterday") {
    return toIsoDate(addDays(referenceDate, -1))
  }

  if (text === "tomorrow") {
    return toIsoDate(addDays(referenceDate, 1))
  }

  const weekdayDate = parseWeekdayDate(text, referenceDate)

  if (weekdayDate) {
    return toIsoDate(weekdayDate)
  }

  const monthDate = parseMonthDate(text, referenceDate)

  if (monthDate) {
    return toIsoDate(monthDate)
  }

  return undefined
}
