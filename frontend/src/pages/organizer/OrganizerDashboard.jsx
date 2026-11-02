import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/events/my_events/').then(({ data }) => setEvents(data)).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: events.length,
    active: events.filter(e => e.status === 'active').length,
    registrations: events.reduce((s, e) => s + (e.registrations_count || 0), 0),
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this event? All confirmed participants will be notified.')) return
    await api.patch(`/events/${id}/cancel/`)
    const { data } = await api.get('/events/my_events/')
    setEvents(data)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Organizer Dashboard</h1>
          <Link to="/events/create"
            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition text-sm">
            + Create Event
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-10">
          {[
            { label: 'My Events', value: stats.total, color: 'text-primary-600' },
            { label: 'Active', value: stats.active, color: 'text-green-600' },
            { label: 'Registrations', value: stats.registrations, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className={`text-4xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-4">My Events</h2>
        {loading ? <LoadingSpinner /> : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            Aucun événement pour le moment. <Link to="/events/create" className="text-primary-600 hover:underline">Créer un événement</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Title', 'Date', 'Capacity', 'Registrations', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-medium text-gray-800">{ev.title}</td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{ev.available_spots}/{ev.capacity}</td>
                    <td className="px-5 py-4 text-gray-500">{ev.registrations_count || 0}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        ev.status === 'active' ? 'bg-green-100 text-green-700' :
                        ev.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                      }`}>{ev.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <Link to={`/organizer/events/${ev.id}/participants`}
                          className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-primary-100 transition">
                          Participants
                        </Link>
                        <Link to={`/organizer/events/${ev.id}/edit`}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                          Edit
                        </Link>
                        <Link to={`/organizer/events/${ev.id}/stats`}
                          className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-amber-100 transition">
                          Stats
                        </Link>
                        {ev.status === 'active' && (
                          <button onClick={() => handleCancel(ev.id)}
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
