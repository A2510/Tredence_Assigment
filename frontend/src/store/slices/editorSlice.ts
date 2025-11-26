import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface EditorState {
  code: string
  language: string
  cursorPosition: number
  autocompleteSuggestion: string | null
  isLoadingSuggestion: boolean
}

const initialState: EditorState = {
  code: '# Start coding here...\n',
  language: 'python',
  cursorPosition: 0,
  autocompleteSuggestion: null,
  isLoadingSuggestion: false,
}

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    setCursorPosition: (state, action: PayloadAction<number>) => {
      state.cursorPosition = action.payload
    },
    setAutocompleteSuggestion: (state, action: PayloadAction<string | null>) => {
      state.autocompleteSuggestion = action.payload
      state.isLoadingSuggestion = false
    },
    setLoadingSuggestion: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSuggestion = action.payload
    },
    clearAutocompleteSuggestion: (state) => {
      state.autocompleteSuggestion = null
      state.isLoadingSuggestion = false
    },
  },
})

export const {
  setCode,
  setLanguage,
  setCursorPosition,
  setAutocompleteSuggestion,
  setLoadingSuggestion,
  clearAutocompleteSuggestion,
} = editorSlice.actions

export default editorSlice.reducer
