import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import './UserList.css'

function UserList() {
  const { users, currentUserId } = useSelector((state: RootState) => state.room)

  return (
    <div className="user-list">
      <h3 className="user-list-title">Online Users ({users.length})</h3>
      <div className="user-list-items">
        {users.map((user) => (
          <div key={user.user_id} className="user-item">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <span className="user-id">
                {user.user_id}
                {user.is_host && <span className="badge host-badge">HOST</span>}
                {user.user_id === currentUserId && <span className="badge you-badge">YOU</span>}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserList
