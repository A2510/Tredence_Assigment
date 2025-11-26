import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import {
  setCode,
  setCursorPosition,
  clearAutocompleteSuggestion,
} from '../store/slices/editorSlice'
import { useAutocomplete } from '../hooks/useAutocomplete'
import './CodeEditor.css'

type CodeEditorProps = {
  sendMessage?: (message: any) => void
}

function CodeEditor({ sendMessage }: CodeEditorProps) {
  const dispatch = useDispatch()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { code, autocompleteSuggestion, language } = useSelector((state: RootState) => state.editor)
  const { roomId } = useSelector((state: RootState) => state.room)
  const { requestAutocomplete } = useAutocomplete()

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    dispatch(setCode(newCode))
    dispatch(clearAutocompleteSuggestion())
    
    // Send update to other users via WebSocket
    if (roomId && sendMessage) {
      sendMessage({
        type: 'code_update',
        code: newCode,
        language: language,
      })
    }

    // Request autocomplete with debounce (handled in useAutocomplete hook)
    const cursorPos = e.target.selectionStart || 0
    dispatch(setCursorPosition(cursorPos))
    requestAutocomplete(newCode, cursorPos, language)
  }, [dispatch, roomId, language, sendMessage, requestAutocomplete])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newCode = code.substring(0, start) + '    ' + code.substring(end)
      dispatch(setCode(newCode))
      
      // Move cursor after tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4
        }
      }, 0)
    }

    // Accept autocomplete suggestion with Tab or Enter
    if ((e.key === 'Tab' || e.key === 'Enter') && autocompleteSuggestion) {
      e.preventDefault()
      const cursorPos = e.currentTarget.selectionStart
      const newCode = code.substring(0, cursorPos) + autocompleteSuggestion + code.substring(cursorPos)
      dispatch(setCode(newCode))
      dispatch(clearAutocompleteSuggestion())
      
      // Move cursor after suggestion
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorPos + autocompleteSuggestion.length
        }
      }, 0)
    }

    // Dismiss autocomplete with Escape
    if (e.key === 'Escape' && autocompleteSuggestion) {
      dispatch(clearAutocompleteSuggestion())
    }
  }, [code, autocompleteSuggestion, dispatch])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <div className="code-editor">
      <div className="editor-header">
        <span className="language-label">{language}</span>
        {autocompleteSuggestion && (
          <span className="autocomplete-hint">
            💡 Press Tab or Enter to accept suggestion
          </span>
        )}
      </div>
      <div className="editor-container">
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          placeholder="Start typing your code here..."
        />
        {autocompleteSuggestion && (
          <div className="autocomplete-suggestion">
            <span className="suggestion-text">{autocompleteSuggestion}</span>
          </div>
        )}
      </div>
      <div className="editor-footer">
        <span>Lines: {code.split('\n').length}</span>
        <span>Characters: {code.length}</span>
      </div>
    </div>
  )
}

export default CodeEditor
