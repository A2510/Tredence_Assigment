const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

interface RoomResponse {
  roomId: string
  code?: string
  language?: string
  created_at?: string
}

interface AutocompleteResponse {
  suggestion: string
  confidence: number
}

export async function createRoom(language: string = 'python'): Promise<RoomResponse> {
  const response = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ language }),
  })

  if (!response.ok) {
    throw new Error('Failed to create room')
  }

  return response.json()
}

export async function getRoom(roomId: string): Promise<RoomResponse> {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`)

  if (!response.ok) {
    throw new Error('Room not found')
  }

  return response.json()
}

export async function getAutocomplete(
  code: string,
  cursorPosition: number,
  language: string
): Promise<AutocompleteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      cursorPosition,
      language,
    }),
  })

  if (!response.ok) {
    throw new Error('Autocomplete request failed')
  }

  return response.json()
}
