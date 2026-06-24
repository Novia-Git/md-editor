import { useState, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { useMarkdown } from './useMarkdown'
import './App.css'

const DEFAULT_CONTENT = `# 歡迎使用 Markdown Editor

## 功能特色

- **即時預覽** — 左側編輯，右側同步渲染
- **語法高亮** — 程式碼區塊自動上色
- GitHub Flavored Markdown (GFM) 支援

## 程式碼範例

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
console.log(greet('World'))
\`\`\`

## 表格

| 功能 | 狀態 |
|------|------|
| 即時預覽 | ✅ |
| 語法高亮 | ✅ |
| GFM 表格 | ✅ |
| 任務清單 | ✅ |

## 任務清單

- [x] 建立編輯器
- [x] 加入即時預覽
- [ ] 加入匯出功能

> 開始在左側輸入 Markdown 吧！
`

export default function App() {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [layout, setLayout] = useState('split') // 'split' | 'editor' | 'preview'
  const html = useMarkdown(content)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
  }, [content])

  const handleClear = useCallback(() => {
    if (confirm('確定清空內容？')) setContent('')
  }, [])

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
  }, [content])

  return (
    <div className="app">
      <header className="toolbar">
        <span className="logo">Markdown Editor</span>
        <div className="toolbar-actions">
          <div className="layout-toggle">
            <button
              className={layout === 'editor' ? 'active' : ''}
              onClick={() => setLayout('editor')}
              title="僅編輯器"
            >Editor</button>
            <button
              className={layout === 'split' ? 'active' : ''}
              onClick={() => setLayout('split')}
              title="分割視圖"
            >Split</button>
            <button
              className={layout === 'preview' ? 'active' : ''}
              onClick={() => setLayout('preview')}
              title="僅預覽"
            >Preview</button>
          </div>
          <button onClick={handleCopy} title="複製 Markdown">Copy</button>
          <button onClick={handleDownload} title="下載 .md 檔">Download</button>
          <button onClick={handleClear} className="danger" title="清空">Clear</button>
        </div>
      </header>

      <main className={`workspace layout-${layout}`}>
        {layout !== 'preview' && (
          <div className="pane editor-pane">
            <div className="pane-label">Markdown</div>
            <CodeMirror
              value={content}
              onChange={setContent}
              theme={oneDark}
              extensions={[
                markdown({ base: markdownLanguage, codeLanguages: languages }),
              ]}
              height="100%"
              style={{ height: '100%' }}
            />
          </div>
        )}

        {layout !== 'editor' && (
          <div className="pane preview-pane">
            <div className="pane-label">Preview</div>
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </main>

      <footer className="statusbar">
        <span>{content.split('\n').length} 行</span>
        <span>{content.length} 字元</span>
        <span>{content.trim().split(/\s+/).filter(Boolean).length} 詞</span>
      </footer>
    </div>
  )
}
