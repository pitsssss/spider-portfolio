import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="not-found" aria-labelledby="not-found-h">
      <h1 id="not-found-h">404</h1>
      <p>This page does not exist.</p>
      <Link href="/" className="btn-primary">Back to home</Link>
    </main>
  )
}
