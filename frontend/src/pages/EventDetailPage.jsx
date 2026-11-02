import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import Footer from '../components/Footer'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [registering, setRegistering] = useState(false)
  const [message, setMessage] = useState(null)
  const [existingRegistration, setExistingRegistration] = useState(null)

  const fetchEvent = () =>
    api.get(`/events/${id}/`)
      .then(({ data }) => setEvent(data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))

  useEffect(() => {
    // Recuperation des evenements depuis l'API.
    fetchEvent()
  }, [id])

  useEffect(() => {
    if (user?.role !== 'participant') {
      setExistingRegistration(null)
      return
    }

    api.get('/registrations/my_registrations/')
      .then(({ data }) => {
        const registrations = Array.isArray(data) ? data : data.results || []
        const current = registrations.find((registration) => String(registration.event?.id) === String(id))
        setExistingRegistration(current || null)
      })
      .catch(() => setExistingRegistration(null))
  }, [id, user])

  async function inscriptionEvenement(e) {
    e.preventDefault()
    if (!localStorage.getItem('access_token')) {
      navigate(`/login?next=/events/${id}`)
      return
    }

    setRegistering(true)
    setMessage(null)
    try {
      const { data } = await api.post('/registrations/', { event_id: Number(id), notes })
      setExistingRegistration(data)
      setMessage({ type: 'success', text: 'Inscription envoyee avec succes.' })
      setNotes('')
      await fetchEvent()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Registration failed.' })
    } finally {
      setRegistering(false)
    }
  }

  if (loading) return <><Navbar /><LoadingSpinner /></>
  if (!event) return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <p className="text-xl font-semibold text-gray-600">Event not found</p>
        <Link to="/events" className="mt-4 text-primary-600 hover:underline text-sm">Back to events</Link>
      </div>
    </>
  )

  const isFull = event.available_spots === 0
  const isCancelled = event.status === 'cancelled'
  const isParticipant = user?.role === 'participant'
  const isLoggedIn = !!localStorage.getItem('access_token')
  const canShowRegistrationForm = isParticipant && !existingRegistration && !isCancelled && !isFull
  const fillRate = event.capacity > 0 ? Math.round(((event.capacity - event.available_spots) / event.capacity) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link to="/events" className="text-sm text-primary-600 hover:underline">Retour aux evenements</Link>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center mt-6">
            <div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize mb-4 ${
                event.status === 'active' ? 'bg-green-100 text-green-700' :
                event.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {event.status}
              </span>
              <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{event.title}</h1>
              <p className="text-gray-600 mt-5 leading-7">{event.description}</p>
            </div>

            {event.banner_image ? (
              <img src={event.banner_image} alt={event.title} className="w-full h-72 object-cover rounded-lg shadow" />
            ) : (
              <div className="w-full h-72 bg-[linear-gradient(135deg,#166a73,#d99a1e)] rounded-lg flex items-center justify-center shadow">
                <span className="text-white text-8xl font-extrabold opacity-25 select-none">{event.title[0]}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Informations pratiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Info label="Date" value={new Date(event.date).toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })} />
              <Info label="Heure" value={new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} />
              <Info label="Lieu" value={event.is_online ? 'En ligne' : event.location} />
              <Info label="Organisateur" value={event.organizer?.name || 'EventMaster'} />
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Remplissage</h2>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-secondary-500 rounded-full" style={{ width: `${fillRate}%` }} />
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-3">
              <span>{event.capacity - event.available_spots} inscrit(s)</span>
              <span>{event.available_spots} place(s) restantes</span>
            </div>
          </section>
        </div>

        <aside className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Inscription</h2>

          {message && (
            <div className={`px-4 py-3 rounded-lg mb-5 text-sm font-medium border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          {canShowRegistrationForm && (
            <form onSubmit={inscriptionEvenement} className="space-y-4">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes pour l'organisateur..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <button
                type="submit"
                disabled={registering}
                className="w-full bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 active:scale-95 transition disabled:opacity-60"
              >
                {registering ? 'Inscription...' : 'S inscrire'}
              </button>
            </form>
          )}

          {!isLoggedIn && !isFull && !isCancelled && (
            <Link
              to={`/login?next=/events/${id}`}
              className="flex justify-center bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 active:scale-95 transition"
            >
              Login to Register
            </Link>
          )}

          {isParticipant && existingRegistration && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm font-medium">
              Already registered. Status: {existingRegistration.status}
            </div>
          )}

          {!existingRegistration && isFull && !isCancelled && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm font-medium">
              Event is full.
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
              This event has been cancelled.
            </div>
          )}

          {!isParticipant && isLoggedIn && (
            <p className="text-sm text-gray-500 mt-4">
              Les inscriptions sont reservees aux comptes participant.
            </p>
          )}
        </aside>
      </main>

      <Footer />
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide mb-1">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  )
}
