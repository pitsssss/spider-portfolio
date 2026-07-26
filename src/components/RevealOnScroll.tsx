'use client'
import { useEffect } from 'react'

export default function RevealOnScroll() {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal')
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    revealElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
