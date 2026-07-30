"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []
    let rafTime = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const particleCount = Math.floor((canvas.width * canvas.height) / 12000)
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random(),
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 2.5 + 0.8,
          opacity: Math.random() * 0.45 + 0.15
        })
      }
    }

    const drawParticles = (time: number = 0) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      rafTime = time * 0.001

      const horizon = canvas.height * 0.5
      const glowShift = Math.sin(rafTime * 0.35) * 180
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "rgba(76, 29, 149, 0.22)")
      gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.08)")
      gradient.addColorStop(1, "rgba(139, 92, 246, 0.2)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.beginPath()
      ctx.fillStyle = `rgba(139, 92, 246, 0.08)`
      ctx.ellipse(canvas.width * 0.5, horizon + glowShift * 0.03, canvas.width * 0.45, canvas.height * 0.25, 0, 0, Math.PI * 2)
      ctx.fill()

      // Draw depth-aware connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const depthDelta = Math.abs(particles[i].z - particles[j].z)

          if (distance < 135 && depthDelta < 0.35) {
            const opacity = (1 - distance / 135) * (0.16 + (1 - depthDelta) * 0.2)
            ctx.beginPath()
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`
            ctx.lineWidth = 0.4 + (1 - depthDelta) * 0.4
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw particles
      for (const particle of particles) {
        const pulse = 0.65 + Math.sin(rafTime * 1.4 + particle.x * 0.01 + particle.y * 0.015) * 0.35
        const depthScale = 0.45 + particle.z * 1.1
        const drawRadius = particle.radius * depthScale * pulse
        const cyanWeight = 120 + Math.round(particle.z * 90)
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          drawRadius * 2.2
        )
        gradient.addColorStop(0, `rgba(${cyanWeight}, 226, 255, ${particle.opacity})`)
        gradient.addColorStop(1, "rgba(6, 182, 212, 0)")
        ctx.fillStyle = gradient
        ctx.arc(particle.x, particle.y, drawRadius * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const updateParticles = () => {
      for (const particle of particles) {
        const drift = 0.2 + particle.z * 0.45
        particle.x += particle.vx * drift
        particle.y += particle.vy * drift + Math.sin(rafTime + particle.x * 0.002) * 0.08

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
      }
    }

    const animate = (time: number = 0) => {
      drawParticles(time)
      updateParticles()
      animationId = requestAnimationFrame(animate)
    }

    resize()
    animate(0)

    window.addEventListener("resize", resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  )
}
