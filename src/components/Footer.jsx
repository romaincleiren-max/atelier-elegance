import { Link } from 'react-router-dom'

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-section">
          <h3>Atelier</h3>
          <p>Bordeaux, France</p>
          <p>Sur rendez-vous uniquement</p>
        </div>

        <div className="footer-section">
          <h3>Créations</h3>
          <Link to="/">Collection</Link>
          <Link to="/la-creatrice">La créatrice</Link>
          <Link to="/essayage">L'atelier</Link>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <a href="mailto:contact@colinecleiren.fr">contact@colinecleiren.fr</a>
          <Link to="/contact">Prendre rendez-vous</Link>
        </div>

        <div className="footer-section">
          <h3>Horaires</h3>
          <p>Lundi – Vendredi · 10h–18h</p>
          <p>Samedi · 10h–17h</p>
        </div>

      </div>

      <div className="footer-bottom">
        <a
          href="https://www.instagram.com/colinecleiren/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-insta"
          aria-label="Instagram Coline Cleiren"
        >
          <InstagramIcon />
          <span>@colinecleiren</span>
        </a>
        <p style={{ marginTop: '1.2rem' }}>
          © {new Date().getFullYear()} &nbsp;Coline Cleiren Couture &nbsp;·&nbsp; Bordeaux
        </p>
      </div>
    </footer>
  )
}
