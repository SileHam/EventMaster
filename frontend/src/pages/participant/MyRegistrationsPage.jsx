import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRegs = () => {
    api.get('/registrations/my_registrations/')
      .then(({ data }) => setRegistrations(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRegs() }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this registration?')) return
    await api.delete(`/registrations/${id}/`)
    fetchRegs()
  }

  const downloadBadge = async (regId) => {
    const response = await api.get(`/exports/badge/${regId}/`, { responseType: 'blob' })
    const badgeUrl = URL.createObjectURL(response.data)
    window.open(badgeUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(badgeUrl), 30000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Registrations</h1>

        {loading ? <LoadingSpinner /> : registrations.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-lg">
            Aucune inscription pour le moment. <a href="/events" className="text-primary-600 hover:underline">Voir les événements</a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Event', 'Date', 'Location', 'Status', 'Registered', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-medium text-gray-800">{reg.event?.title}</td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(reg.event?.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{reg.event?.is_online ? 'Online' : reg.event?.location}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[reg.status]}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {new Date(reg.registered_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {reg.status === 'confirmed' && (
                          <button onClick={() => downloadBadge(reg.id)}
                            className="bg-primary-100 text-primary-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-primary-200 transition">
                            Badge
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(reg.status) && (
                          <button onClick={() => handleCancel(reg.id)}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
