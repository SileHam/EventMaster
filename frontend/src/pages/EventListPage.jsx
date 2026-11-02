import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Footer from '../components/Footer'
import api from '../api/axios'

const categoryFilters = ['Tous', 'Conference', 'Atelier', 'Formation', 'Competition', 'Club etudiant']

function categoryOf(event) {
  const source = `${event.title} ${event.description}`.toLowerCase()
  if (source.includes('club') || source.includes('etudiant')) return 'Club etudiant'
  if (source.includes('competition') || source.includes('challenge') || source.includes('tournoi')) return 'Competition'
  if (source.includes('formation') || source.includes('cours')) return 'Formation'
  if (source.includes('atelier') || source.includes('workshop') || source.includes('react')) return 'Atelier'
  if (source.includes('conference') || source.includes('webinaire') || event.is_online) return 'Conference'
  return 'Autre'
}

export default function EventListPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [category, setCategory] = useState('Tous')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  function fetchEvents(p = 1) {
    const params = new URLSearchParams({ page: String(p) })
    if (search) params.set('search', search)
    if (location) params.set('location', location)
    if (dateFrom) params.set('date_from', dateFrom)

    return api.get(`/events/?${params.toString()}`).then(({ data }) => data)
  }

  const chargerListe = (p = 1) => {
    setLoading(true)
    fetchEvents(p)
      .then((resultat) => {
        setEvents(resultat.results || [])
        setTotalPages(Math.ceil((resultat.count || 0) / 10))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { chargerListe(1) }, [])

  const filteredEvents = useMemo(() => {
    if (category === 'Tous') return events
    return events.filter((event) => categoryOf(event) === category)
  }, [events, category])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    chargerListe(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-sm font-semibold text-secondary-600 mb-2">Catalogue EventMaster</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">Tous les evenements</h1>
              <p className="text-gray-500 mt-3 max-w-2xl">
                Recherchez une conference, un atelier, une formation, une competition ou une activite de club etudiant.
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
              {events.length} evenement(s) charges
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-5">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Recherche</label>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Titre, theme, mot cle..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Lieu</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Salle, campus ou ville..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Type d'evenement</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categoryFilters.map((filter) => (
                  <option key={filter} value={filter}>{filter}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition text-sm">
                Chercher
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          {categoryFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setCategory(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                category === filter
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-100 text-gray-400 text-lg">
                Aucun evenement trouve.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evenement) => <EventCard key={evenement.id} event={evenement} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); chargerListe(p) }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      p === page ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
