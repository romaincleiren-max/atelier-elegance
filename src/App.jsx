import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Account from './pages/Account'
import Admin from './pages/Admin'
import AdminCollections from './pages/AdminCollections'
import AdminPhotos from './pages/AdminPhotos'
import AdminLogos from './pages/AdminLogos'
import AdminSettings from './pages/AdminSettings'
import Contact from './pages/Contact'
import Essayage from './pages/Essayage'
import BookAppointment from './pages/BookAppointment'
import AuthDebug from './pages/AuthDebug'
import './styles/main.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/essayage" element={<Essayage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/admin/collections" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminCollections />
              </ProtectedRoute>
            } />
            <Route path="/admin/photos" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPhotos />
              </ProtectedRoute>
            } />
            <Route path="/admin/logos" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLogos />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/auth-debug" element={<AuthDebug />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
