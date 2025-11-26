import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import CodeEditor from '../components/CodeEditor'
import StatusBar from '../components/StatusBar'
import UserList from '../components/UserList'
import { setCode, setLanguage } from '../store/slices/editorSlice'
import { setRoomId } from '../store/slices/roomSlice'
import { useWebSocket } from '../hooks/useWebSocket'
import { getRoom } from '../services/api'
import './Room.css'

function Room() {
  const { roomId } = useParams<{ roomId: string }>()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize WebSocket connection
  const { sendMessage } = useWebSocket(roomId || '')

  useEffect(() => {
    const initRoom = async () => {
      if (!roomId) {
        setError('Invalid room ID')
        setLoading(false)
        return
      }

      try {
        dispatch(setRoomId(roomId))
        const roomData = await getRoom(roomId)
        dispatch(setCode(roomData.code || '# Start coding here...\n'))
        dispatch(setLanguage(roomData.language || 'python'))
        setLoading(false)
      } catch (err) {
        setError('Room not found or failed to load')
        setLoading(false)
        console.error(err)
      }
    }

    initRoom()
  }, [roomId, dispatch])

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId)
      alert('Room ID copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="room loading">
        <div className="loading-spinner">Loading room...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="room error-container">
        <div className="error">{error}</div>
        <a href="/">Go back to home</a>
      </div>
    )
  }

  return (
    <div className="room">
      <div className="room-header">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <button onClick={handleCopyRoomId} className="copy-button">
            📋 Copy Room ID
          </button>
        </div>
      </div>

      <div className="room-content">
        <UserList />
        <CodeEditor sendMessage={sendMessage} />
      </div>

      <StatusBar />
    </div>
  )
}

export default Room
