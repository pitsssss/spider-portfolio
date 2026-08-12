import { profile } from '@/content/profile'

export default function Footer() {
  return (
    <footer role="contentinfo" className="site-footer">
      <p>&copy; {new Date().getFullYear()} {profile.name}</p>
    </footer>
  )
}
