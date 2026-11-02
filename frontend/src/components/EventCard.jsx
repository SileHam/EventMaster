import { Link } from 'react-router-dom'

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
}

function guessCategory(event) {
  const title = `${event.title} ${event.description}`.toLowerCase()
  if (title.includes('club') || title.includes('etudiant')) return 'Club etudiant'
  if (title.includes('competition') || title.includes('challenge') || title.includes('tournoi')) return 'Competition'
  if (title.includes('formation') || title.includes('cours')) return 'Formation'
  if (title.includes('atelier') || title.includes('workshop') || title.includes('react')) return 'Atelier'
  if (title.includes('conference') || title.includes('webinaire') || event.is_online) return 'Conference'
  return 'Evenement'
}

export default function EventCard({ event }) {
  const spotsLeft = event.available_spots
  const isFull = spotsLeft === 0
  const canRegister = event.status === 'active' && !isFull
  const formattedDate = new Date(event.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
      <div className="relative">
        {event.banner_image ? (
          <img
            src={event.banner_image}
            alt={event.title}
            className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-44 bg-[linear-gradient(135deg,#166a73,#d99a1e)] flex items-center justify-center">
            <span className="text-white text-5xl font-black opacity-25">{event.title[0]}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 bg-white/95 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {guessCategory(event)}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">{event.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[event.status]}`}>
            {event.status}
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="text-sm text-gray-600 space-y-3 mb-4">
          <div className="flex items-start justify-between gap-3">
            <span className="font-medium text-gray-800">Date</span>
            <span className="text-right text-gray-500">{formattedDate}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="font-medium text-gray-800">Lieu</span>
            <span className="text-right text-gray-500 truncate max-w-[170px]">{event.is_online ? 'En ligne' : event.location}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="font-medium text-gray-800">Places</span>
            <span className={`text-right font-semibold ${isFull ? 'text-red-500' : 'text-green-600'}`}>
              {isFull ? 'Complet' : `${spotsLeft} restantes`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-xs text-gray-400">
            Capacite: {event.capacity}
          </span>
          <Link
            to={`/events/${event.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              canRegister
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {canRegister ? "S'inscrire" : 'Voir details'}
          </Link>
        </div>
      </div>
    </article>
  )
}
