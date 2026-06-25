import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth'
import TurndownService from 'turndown'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const MAX_SIZE_BYTES = 10 * 1024 * 1024  // 10 MB
const MAX_PDF_PAGES = 20

export function validateFile(file) {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`檔案過大（${(file.size / 1024 / 1024).toFixed(1)} MB），上限為 10 MB`)
  }
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext !== 'pdf' && ext !== 'docx') {
    throw new Error('僅支援 .pdf 或 .docx 格式')
  }
}

export async function convertDocxToMarkdown(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
  return td.turndown(result.value)
}

export async function convertPdfToMarkdown(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise

  if (pdf.numPages > MAX_PDF_PAGES) {
    throw new Error(`PDF 共 ${pdf.numPages} 頁，超過上限（${MAX_PDF_PAGES} 頁）`)
  }

  const parts = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = buildPageText(content.items)
    if (text) parts.push(text)
  }

  return parts.join('\n\n---\n\n')
}

function buildPageText(items) {
  if (!items.length) return ''

  const byY = new Map()
  for (const item of items) {
    if (!item.str.trim()) continue
    const y = Math.round(item.transform[5])
    if (!byY.has(y)) byY.set(y, [])
    byY.get(y).push({ x: item.transform[4], str: item.str })
  }

  return [...byY.entries()]
    .sort(([a], [b]) => b - a)
    .map(([, cells]) =>
      cells.sort((a, b) => a.x - b.x).map(c => c.str).join(' ').trim()
    )
    .filter(Boolean)
    .join('\n')
}
