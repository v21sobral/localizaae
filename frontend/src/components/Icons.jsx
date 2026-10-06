const base = (size, sw) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: sw,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})
export const Search = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)
export const MapPin = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
export const Calendar = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)
export const Package = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M16.5 9.4 7.55 4.24" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" x2="12" y1="22.08" y2="12" />
  </svg>
)
export const ChevronRight = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="m9 18 6-6-6-6" />
  </svg>
)
export const ChevronDown = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)
export const ArrowLeft = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
)
export const Menu = ({ size = 20, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)
export const LogOut = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)
export const LayoutDashboard = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
)
export const Inbox = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)
export const BarChart2 = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <line x1="18" x2="18" y1="20" y2="10" />
    <line x1="12" x2="12" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="14" />
  </svg>
)
export const Tag = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l6.58-6.58a1 1 0 0 0 0-1.42Z" />
    <path d="M7 7h.01" />
  </svg>
)
export const CheckCircle = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
export const Clock = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
export const AlertCircle = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
)
export const Pencil = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
)
export const Trash2 = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
)
export const Plus = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </svg>
)
export const User = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
export const Lock = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
export const X = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
export const Check = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
export const FileText = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)
export const Filter = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)
export const Upload = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
)
export const Shield = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
export const Building = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
)
export const TrendingUp = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)
export const MoreHorizontal = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
)
export const Sun = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
)
export const Moon = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
)
export const Download = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
)
export const Printer = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect width="12" height="8" x="6" y="14" />
  </svg>
)
export const AlertTriangle = ({ size = 16, strokeWidth = 2, style }) => (
  <svg {...base(size, strokeWidth)} style={style}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
)
