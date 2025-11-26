import { useCallback, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setAutocompleteSuggestion, setLoadingSuggestion } from '../store/slices/editorSlice'
import { getAutocomplete } from '../services/api'

export function useAutocomplete() {
  const dispatch = useDispatch()
  const timeoutRef = useRef<number>()

  const requestAutocomplete = useCallback((code: string, cursorPosition: number, language: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set loading state
    dispatch(setLoadingSuggestion(true))

    // Debounce autocomplete requests (600ms as per requirement)
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await getAutocomplete(code, cursorPosition, language)
        
        // Only show suggestion if confidence is above threshold
        if (response.confidence > 0.3) {
          dispatch(setAutocompleteSuggestion(response.suggestion))
        } else {
          dispatch(setAutocompleteSuggestion(null))
        }
      } catch (error) {
        console.error('Autocomplete error:', error)
        dispatch(setAutocompleteSuggestion(null))
      }
    }, 600)
  }, [dispatch])

  return { requestAutocomplete }
}
