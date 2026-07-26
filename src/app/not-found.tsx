import Link from 'next/link'
export default function NotFound() {
  return (
    <main style={{ minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0A0A0F',color:'#E0E0E0',fontFamily:"'DM Sans',sans-serif",padding:24 }}>
      <div style={{ fontSize:'6rem' }}>🕸️</div>
      <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'4rem',color:'#B11310' }}>404</h1>
      <p style={{ color:'#808080',fontSize:'1.2rem',marginBottom:32 }}>Lost in the multiverse? This page doesn&apos;t exist.</p>
      <Link href="/" style={{ padding:'14px 32px',background:'#B11310',color:'#fff',fontWeight:700,borderRadius:12,textDecoration:'none' }}>Swing Back Home</Link>
    </main>
  )
}
