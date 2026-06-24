import { useState, useEffect } from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import DOMPurify from 'dompurify'

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeHighlight, { ignoreMissing: true })
  .use(rehypeStringify)

export function useMarkdown(markdown) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    processor.process(markdown).then((result) => {
      if (!cancelled) {
        setHtml(DOMPurify.sanitize(String(result)))
      }
    })
    return () => { cancelled = true }
  }, [markdown])

  return html
}
