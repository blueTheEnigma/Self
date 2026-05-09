'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { 
    href: '/dashboard', 
    label: 'Today',    
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z"/><path d="M12 8v4l3 3"/>
      </svg>
    ) 
  },
  { 
    href: '/goals',     
    label: 'Goals',    
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ) 
  },
  { 
    href: '/partners',  
    label: 'Circle', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ) 
  },
  { 
    href: '/settings',  
    label: 'You',      
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ) 
  },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      {links.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          id={`nav-${label.toLowerCase()}`}
          className={`nav-item ${pathname.startsWith(href) ? 'active' : ''}`}
          aria-current={pathname.startsWith(href) ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">{icon}</span>
          <span className="nav-label">{label}</span>
        </Link>
      ))}
    </nav>
  )
}
