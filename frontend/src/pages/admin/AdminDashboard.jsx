import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const loadDashboard = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/stats/'),
      api.get('/admin/users/'),
    ]).then(([statsResponse, usersResponse]) => {
      setStats(statsResponse.data)
      setUsers(usersResponse.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadDashboard() }, [])

  async function updateUser(userId, payload) {
    setUpdatingId(userId)
    try {
      const { data } = await api.patch(`/admin/users/${userId}/change_role/`, payload)
      setUsers((currentUsers) => currentUsers.map((user) => user.id === userId ? data : user))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {loading ? <LoadingSpinner /> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {[
                { label: 'Total users', value: stats?.total_users ?? 0 },
                { label: 'Total events', value: stats?.total_events ?? 0 },
                { label: 'Total registrations', value: stats?.total_registrations ?? 0 },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-4xl font-extrabold text-primary-700 mt-2">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Role', 'Status'].map((header) => (
                      <th key={header} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-800">{user.name}</td>
                      <td className="px-5 py-4 text-gray-500">{user.email}</td>
                      <td className="px-5 py-4 text-gray-400">{user.phone || '-'}</td>
                      <td className="px-5 py-4">
                        <select
                          value={user.role}
                          onChange={(event) => updateUser(user.id, { role: event.target.value })}
                          disabled={updatingId === user.id}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="participant">Participant</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                          disabled={updatingId === user.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                            user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
