import { useEffect, useCallback, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setCode } from '../store/slices/editorSlice'
import { setConnected, setConnectionError, setUserCount, setUsers, setCurrentUser } from '../store/slices/roomSlice'

export function useWebSocket(roomId: string) {
  const dispatch = useDispatch()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number>()

  const connect = useCallback(() => {
    if (!roomId) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/${roomId}`
    
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      dispatch(setConnected(true))
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        switch (message.type) {
          case 'init':
            // Initial room state with user count and user info
            dispatch(setCode(message.code || ''))
            dispatch(setUserCount(message.userCount || 1))
            dispatch(setUsers(message.users || []))
            dispatch(setCurrentUser({ userId: message.userId, isHost: message.isHost }))
            break
          
          case 'code_update':
            // Another user updated the code
            dispatch(setCode(message.code || ''))
            break
          
          case 'user_join':
            // Update to actual count and user list from server
            if (message.userCount !== undefined) {
              dispatch(setUserCount(message.userCount))
            }
            if (message.users) {
              dispatch(setUsers(message.users))
            }
            break
          
          case 'user_leave':
            // Update to actual count and user list from server
            if (message.userCount !== undefined) {
              dispatch(setUserCount(message.userCount))
            }
            if (message.users) {
              dispatch(setUsers(message.users))
            }
            break
          
          default:
            console.log('Unknown message type:', message.type)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      dispatch(setConnectionError('Connection error'))
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      dispatch(setConnected(false))
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...')
        connect()
      }, 3000)
    }
  }, [roomId, dispatch])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return { sendMessage }
}
