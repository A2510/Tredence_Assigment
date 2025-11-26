import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import './StatusBar.css'

function StatusBar() {
  const { isConnected, roomId, userCount } = useSelector((state: RootState) => state.room)

  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="status-indicator">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        {roomId && (
          <div className="room-id-display">
            Room: <strong>{roomId}</strong>
          </div>
        )}
      </div>
      <div className="status-right">
        <span>👥 {userCount > 0 ? userCount : 1} user{userCount !== 1 ? 's' : ''} online</span>
      </div>
    </div>
  )
}

export default StatusBar
