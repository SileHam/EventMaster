import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

const COLORS = ['#16a34a', '#d99a1e', '#dc2626']

export default function EventStatsPage() {
  const { id } = useParams()
  const [stats, setStats] = useState(null)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}/`),
      api.get(`/events/${id}/stats/`),
    ]).then(([eventResponse, statsResponse]) => {
      setEvent(eventResponse.data)
      setStats(statsResponse.data)
    }).finally(() => setLoading(false))
  }, [id])

  const chartData = stats ? [
    { name: 'Confirmed', value: stats.confirmed },
    { name: 'Pending', value: stats.pending },
    { name: 'Cancelled', value: stats.cancelled },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to={`/events/${id}/participants`} className="text-primary-600 text-sm hover:underline">Back to participants</Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Event statistics</h1>
        {event && <p className="text-gray-500 mt-1">{event.title}</p>}

        {loading ? <LoadingSpinner /> : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] mt-8">
            <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Fill rate</h2>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600" style={{ width: `${stats.fill_rate}%` }} />
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-3">
                <span>{stats.fill_rate}% confirmed</span>
                <span>{stats.available_spots} / {stats.capacity} spots left</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  ['Total', stats.total_registered],
                  ['Confirmed', stats.confirmed],
                  ['Pending', stats.pending],
                  ['Cancelled', stats.cancelled],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Status split</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
