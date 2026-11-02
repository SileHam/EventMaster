import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function EditEventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/events/${id}/`).then(({ data }) => {
      setForm({
        title: data.title, description: data.description,
        date: data.date?.slice(0, 16), location: data.location,
        is_online: data.is_online, capacity: data.capacity,
        is_public: data.is_public, status: data.status,
      })
      if (data.banner_image) setPreview(data.banner_image)
    }).finally(() => setLoading(false))
  }, [id])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (image) fd.append('banner_image', image)
      await api.put(`/events/${id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      navigate('/organizer')
    } catch (err) {
      const data = err.response?.data
      setError(data?.detail || Object.values(data || {})[0]?.[0] || 'Failed to update.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <><Navbar /><LoadingSpinner /></>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Event</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <div>
            <label className="label">Title</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea required value={form.description} onChange={e => set('description', e.target.value)} rows={4} className="input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date & Time</label>
              <input type="datetime-local" required value={form.date} onChange={e => set('date', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Capacity</label>
              <input type="number" required min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={form.is_online} onChange={e => set('is_online', e.target.checked)} className="w-4 h-4 accent-primary-600" />
              Online Event
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={form.is_public} onChange={e => set('is_public', e.target.checked)} className="w-4 h-4 accent-primary-600" />
              Public Event
            </label>
          </div>
          <div>
            <label className="label">Banner Image</label>
            <input type="file" accept="image/*" onChange={handleImage}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            {preview && <img src={preview} alt="preview" className="mt-3 h-40 w-full object-cover rounded-xl" />}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-primary-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/organizer')}
              className="px-8 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .input { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.625rem 1rem; font-size: 0.875rem; outline: none; }
      `}</style>
    </div>
  )
}
