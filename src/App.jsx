import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Account from './pages/Account'
import Admin from './pages/Admin'
import AdminCollections from './pages/AdminCollections'
import AdminPhotos from './pages/AdminPhotos'
import AdminSettings from './pages/AdminSettings'
import Contact from './pages/Contact'
import Essayage from './pages/Essayage'
import BookAppointment from './pages/BookAppointment'
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
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/collections" element={<AdminCollections />} />
            <Route path="/admin/photos" element={<AdminPhotos />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
