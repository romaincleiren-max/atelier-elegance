export default function DressSVG() {
  return (
    <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#ffffff", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#f5f5f5", stopOpacity:1}} />
        </linearGradient>
      </defs>
      <path
        d="M100,40 L80,60 L70,100 L60,200 L60,280 L140,280 L140,200 L130,100 L120,60 Z"
        fill="url(#dressGradient)"
        stroke="#d4b5a0"
        strokeWidth="2"
      />
      <ellipse cx="100" cy="50" rx="25" ry="15" fill="#ffffff" stroke="#d4b5a0" strokeWidth="2"/>
      <circle cx="100" cy="50" r="3" fill="#a67c52"/>
      <circle cx="90" cy="55" r="2" fill="#a67c52"/>
      <circle cx="110" cy="55" r="2" fill="#a67c52"/>
      <path d="M70,100 Q100,110 130,100" fill="none" stroke="#d4b5a0" strokeWidth="1" opacity="0.5"/>
      <path d="M65,150 Q100,160 135,150" fill="none" stroke="#d4b5a0" strokeWidth="1" opacity="0.5"/>
      <path d="M62,200 Q100,210 138,200" fill="none" stroke="#d4b5a0" strokeWidth="1" opacity="0.5"/>
    </svg>
  )
}
