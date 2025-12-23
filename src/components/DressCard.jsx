import DressSVG from './DressSVG'

export default function DressCard({ dress, onViewDetails, onBookAppointment }) {
  return (
    <div className="dress-card">
      <div className="dress-image">
        <DressSVG />
      </div>
      <div className="dress-info">
        <div className="dress-style">{dress.style}</div>
        <h3 className="dress-title">{dress.name}</h3>
        <p className="dress-description">{dress.description}</p>
        <div className="dress-price">{dress.price}€</div>
        <div className="dress-actions">
          <button
            className="action-btn btn-primary"
            onClick={() => onViewDetails(dress)}
          >
            Voir Détails
          </button>
          <button
            className="action-btn btn-secondary"
            onClick={() => onBookAppointment(dress)}
          >
            Essayer
          </button>
        </div>
      </div>
    </div>
  )
}
