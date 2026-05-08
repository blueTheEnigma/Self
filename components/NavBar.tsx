'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Today',    icon: '◎' },
  { href: '/goals',     label: 'Goals',    icon: '⊕' },
  { href: '/partners',  label: 'Partners', icon: '⊗' },
  { href: '/settings',  label: 'You',      icon: '⊘' },
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
          {label}
        </Link>
      ))}
    </nav>
  )
}
