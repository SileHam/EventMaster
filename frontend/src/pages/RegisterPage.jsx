import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inscrireUtilisateur = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      navigate('/events')
    } catch (err) {
      const apiError = err.response?.data
      setError(apiError?.email?.[0] || apiError?.password?.[0] || 'Account creation failed.')
    } finally {
      setLoading(false)
    }
  }

  function champ(label, key, type = 'text', placeholder = '') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          value={form[key]}
          placeholder={placeholder}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-10">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 h-12 w-12 rounded-md bg-primary-700 text-white grid place-items-center text-sm font-black">EMSI</div>
          <h1 className="text-3xl font-extrabold text-primary-700">EventMaster</h1>
          <p className="text-gray-500 mt-1">Create an account for EMSI events</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">{error}</div>}

        <form onSubmit={inscrireUtilisateur} className="space-y-4">
          {champ('Full name', 'name', 'text', 'Hamza Zniber')}
          {champ('Email', 'email', 'email', 'name@example.com')}
          {champ('Phone optional', 'phone', 'tel', '+212 6 00 00 00 00')}
          {champ('Password', 'password', 'password', '********')}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-60 mt-2"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
