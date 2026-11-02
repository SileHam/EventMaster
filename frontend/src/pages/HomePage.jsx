import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import Footer from '../components/Footer'
import api from '../api/axios'

export default function HomePage() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.get('/events/?page=1')
      .then(({ data }) => setEvents(data.results?.slice(0, 6) || []))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-[linear-gradient(135deg,#12343b,#166a73_55%,#b87912)] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <p className="text-primary-100 text-sm font-semibold mb-4">Billetterie academique et gestion interne</p>
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              EventMaster
            </h1>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl leading-8">
              Une plateforme pour publier les evenements, gerer les inscriptions,
              confirmer les participants, exporter les listes et generer les badges.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                to="/events"
                className="bg-white text-primary-700 font-bold px-7 py-3 rounded-full hover:bg-primary-50 transition shadow"
              >
                Explorer les evenements
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white font-bold px-7 py-3 rounded-full hover:bg-white hover:text-primary-700 transition"
              >
                Creer un compte
              </Link>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-lg p-5 backdrop-blur-sm">
            <div className="bg-white text-gray-900 rounded-lg p-5 shadow-xl">
              <p className="text-xs font-semibold text-secondary-600 mb-2">Demo rapide</p>
              <h2 className="text-xl font-bold mb-4">Parcours disponibles</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Participant</span>
                  <span className="font-semibold text-primary-700">Inscription + badge</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Organizer</span>
                  <span className="font-semibold text-primary-700">Evenements + exports</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin</span>
                  <span className="font-semibold text-primary-700">Users + stats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Inscriptions', value: 'Suivi par statut', desc: 'Pending, confirmed ou cancelled selon la validation.' },
              { label: 'Exports', value: 'PDF + Excel', desc: 'Listes de presence et badges telechargeables.' },
              { label: 'Prediction', value: 'IA simple', desc: 'Estimation basee sur les inscriptions et la capacite.' },
            ].map((feature) => (
              <div key={feature.label} className="p-6 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-sm text-secondary-600 font-semibold">{feature.label}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{feature.value}</h3>
                <p className="text-sm text-gray-500 mt-3 leading-6">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end gap-4 mb-8">
              <div>
                <p className="text-sm font-semibold text-secondary-600 mb-1">A la une</p>
                <h2 className="text-3xl font-bold text-gray-800">Evenements a venir</h2>
              </div>
              <Link to="/events" className="text-primary-600 font-medium hover:underline">Tout voir</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evenement) => <EventCard key={evenement.id} event={evenement} />)}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
