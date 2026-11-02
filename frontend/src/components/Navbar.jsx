import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-primary-100 transition">
            <span className="h-9 w-10 rounded-md bg-white text-primary-700 grid place-items-center text-xs font-black border-b-4 border-secondary-500">EMSI</span>
            <span>EventMaster</span>
          </Link>

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/events" className="hover:text-primary-100 transition">Events</Link>

            {!user ? (
              <>
                <Link to="/login" className="hover:text-primary-100 transition">Login</Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-4 py-1.5 rounded-full hover:bg-primary-50 transition font-semibold"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {user.role === 'participant' && (
                  <Link to="/my-registrations" className="hover:text-primary-100 transition">
                    My Registrations
                  </Link>
                )}
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <Link to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'} className="hover:text-primary-100 transition">
                    Dashboard
                  </Link>
                )}
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <Link to="/events/create" className="hover:text-primary-100 transition">
                    Create Event
                  </Link>
                )}
                {user.role === 'admin' && (
                  <a href="/admin/" className="hover:text-primary-100 transition">
                    Admin Panel
                  </a>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-primary-100 text-xs">
                    {user.name} <span className="bg-primary-700 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-primary-600 px-4 py-1.5 rounded-full hover:bg-primary-50 transition font-semibold text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
