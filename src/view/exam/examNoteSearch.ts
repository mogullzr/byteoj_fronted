export type ExamNoteSearchHit = {
  noteId: number
  recordId: number
  examId: number
  examName: string
  problemId: number
  questionNumber: number
  noteUpdatedAt?: string
  snippet: string
  similarity?: number
}

export type ExamNoteSearchPage = {
  records: ExamNoteSearchHit[]
  total: number
  pageNum: number
  pageSize: number
}

export function noteSheetLocation(hit: ExamNoteSearchHit) {
  return {
    path: '/exam/sheet',
    query: { exam_id: String(hit.examId), recordId: String(hit.recordId), noteProblemId: String(hit.problemId) },
  }
}

export function readNoteProblemId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

export function noteSnippetParts(text: string, keyword: string): { text: string; matched: boolean }[] {
  const terms = [...new Set(keyword.trim().toLowerCase().split(/\s+/).filter(Boolean))]
  if (!terms.length) return [{ text, matched: false }]
  const lower = text.toLowerCase()
  const parts: { text: string; matched: boolean }[] = []
  let cursor = 0
  while (cursor < text.length) {
    let at = -1
    let length = 0
    for (const term of terms) {
      const found = lower.indexOf(term, cursor)
      if (found >= 0 && (at < 0 || found < at || (found === at && term.length > length))) {
        at = found
        length = term.length
      }
    }
    if (at < 0) { parts.push({ text: text.slice(cursor), matched: false }); break }
    if (at > cursor) parts.push({ text: text.slice(cursor, at), matched: false })
    parts.push({ text: text.slice(at, at + length), matched: true })
    cursor = at + length
  }
  return parts
}
