import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-primary-100">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-9 w-10 rounded-md bg-white text-primary-700 grid place-items-center text-xs font-black border-b-4 border-secondary-500">
              EM
            </span>
            <span className="font-bold text-lg text-white">EventMaster</span>
          </div>
          <p className="text-sm leading-6 text-primary-100/80 max-w-md">
            Plateforme de gestion des evenements academiques: inscription, suivi
            des participants, badges PDF, exports et tableaux de bord.
          </p>
          <p className="text-xs text-primary-100/60 mt-4">
            Realise par Hamza Zniber & Youssef Sebsab - 3IIR - 2025/2026
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Explorer</h3>
          <div className="space-y-2 text-sm">
            <Link to="/events" className="block hover:text-white">Evenements</Link>
            <Link to="/login" className="block hover:text-white">Connexion</Link>
            <Link to="/register" className="block hover:text-white">Creer un compte</Link>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Aide</h3>
          <div className="space-y-2 text-sm text-primary-100/80">
            <p>Support: contact@example.com</p>
            <p>FAQ: gestion des inscriptions et badges</p>
            <p>Projet PFA - version demo locale</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
