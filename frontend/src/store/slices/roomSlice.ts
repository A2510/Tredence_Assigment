import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  user_id: string
  is_host: boolean
}

interface RoomState {
  roomId: string | null
  isConnected: boolean
  connectionError: string | null
  userCount: number
  users: User[]
  currentUserId: string | null
  isHost: boolean
}

const initialState: RoomState = {
  roomId: null,
  isConnected: false,
  connectionError: null,
  userCount: 0,
  users: [],
  currentUserId: null,
  isHost: false,
}

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
      if (action.payload) {
        state.connectionError = null
      }
    },
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionError = action.payload
      state.isConnected = false
    },
    setUserCount: (state, action: PayloadAction<number>) => {
      state.userCount = action.payload
    },
    incrementUserCount: (state) => {
      state.userCount += 1
    },
    decrementUserCount: (state) => {
      if (state.userCount > 0) {
        state.userCount -= 1
      }
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload
    },
    setCurrentUser: (state, action: PayloadAction<{ userId: string; isHost: boolean }>) => {
      state.currentUserId = action.payload.userId
      state.isHost = action.payload.isHost
    },
  },
})

export const {
  setRoomId,
  setConnected,
  setConnectionError,
  setUserCount,
  incrementUserCount,
  decrementUserCount,
  setUsers,
  setCurrentUser,
} = roomSlice.actions

export default roomSlice.reducer
