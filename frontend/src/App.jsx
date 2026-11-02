import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EventListPage from './pages/EventListPage'
import EventDetailPage from './pages/EventDetailPage'
import MyRegistrationsPage from './pages/participant/MyRegistrationsPage'
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import CreateEventPage from './pages/organizer/CreateEventPage'
import EditEventPage from './pages/organizer/EditEventPage'
import ParticipantListPage from './pages/organizer/ParticipantListPage'
import EventStatsPage from './pages/organizer/EventStatsPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<EventListPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />

          <Route path="/my-registrations" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <MyRegistrationsPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/organizer" element={<Navigate to="/dashboard" />} />

          <Route path="/events/create" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <CreateEventPage />
            </ProtectedRoute>
          } />
          <Route path="/organizer/events/create" element={<Navigate to="/events/create" />} />

          <Route path="/events/:id/edit" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <EditEventPage />
            </ProtectedRoute>
          } />
          <Route path="/organizer/events/:id/edit" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <EditEventPage />
            </ProtectedRoute>
          } />

          <Route path="/events/:id/participants" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <ParticipantListPage />
            </ProtectedRoute>
          } />
          <Route path="/organizer/events/:id/participants" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <ParticipantListPage />
            </ProtectedRoute>
          } />

          <Route path="/events/:id/stats" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <EventStatsPage />
            </ProtectedRoute>
          } />
          <Route path="/organizer/events/:id/stats" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <EventStatsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={<Navigate to="/admin-dashboard" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
