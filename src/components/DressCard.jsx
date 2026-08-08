import DressSVG from './DressSVG'

export default function DressCard({ dress, onViewDetails }) {
  return (
    <div
      className="dress-card-elegant"
      onClick={() => onViewDetails(dress)}
    >
      {/* Image — occupe tout l'espace, ratio 2:3 */}
      <div className="dress-image">
        {dress.image_url ? (
          <img
            src={dress.image_url}
            alt={dress.name}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <DressSVG />
        )}
      </div>

      {/* Infos sous l'image */}
      <div className="dress-info">
        <div className="dress-style">{dress.style || dress.category}</div>
        <h3 className="dress-title">{dress.name}</h3>
        {dress.price && (
          <div className="dress-price">{dress.price} €</div>
        )}
      </div>
    </div>
  )
}
