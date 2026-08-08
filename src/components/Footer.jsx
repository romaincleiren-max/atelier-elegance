import { Link } from 'react-router-dom'

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
          <a href="#">Robes sur mesure</a>
          <a href="#">Retouches & ajustements</a>
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
        <p>© {new Date().getFullYear()} &nbsp;Coline Cleiren Couture &nbsp;·&nbsp; Bordeaux</p>
      </div>
    </footer>
  )
}
