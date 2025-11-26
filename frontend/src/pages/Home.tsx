import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom } from '../services/api'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joinRoomId, setJoinRoomId] = useState('')

  const handleCreateRoom = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await createRoom('python')
      navigate(`/room/${response.roomId}`)
    } catch (err) {
      setError('Failed to create room. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      navigate(`/room/${joinRoomId.trim()}`)
    }
  }

  return (
    <div className="home">
      <div className="home-header">
        <h1>🚀 Real-Time Pair Programming</h1>
        <p>Collaborate on code in real-time with your team</p>
      </div>

      <div className="home-content">
        {error && <div className="error">{error}</div>}

        <div className="action-card">
          <h2>Create New Room</h2>
          <p>Start a new collaborative coding session</p>
          <button 
            onClick={handleCreateRoom} 
            disabled={loading}
            className="primary-button"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="action-card">
          <h2>Join Existing Room</h2>
          <p>Enter the room ID shared with you</p>
          <div className="join-form">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button 
              onClick={handleJoinRoom}
              disabled={!joinRoomId.trim()}
              className="primary-button"
            >
              Join Room
            </button>
          </div>
        </div>

        <div className="features">
          <h3>Features</h3>
          <ul>
            <li>Real-time collaborative editing</li>
            <li>AI-powered autocomplete suggestions</li>
            <li> Multiple users per room</li>
            <li>Persistent code storage</li>
            <li>WebSocket-based synchronization</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home
