"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

const NAV_LINKS = [
  { href: "/verify", label: "সংগ্রহশালা" },
  { href: "/memorial", label: "শহীদ তালিকা" },
  { href: "/map", label: "ইতিহাস" },
  { href: "/analyze", label: "বিশ্লেষণ" },
  { href: "/vault", label: "ভল্ট" },
  { href: "/aid", label: "সহায়তা" },
] as const

export function MemorialShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === "/"

  const navRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 })

  // Reveal-on-scroll via IntersectionObserver (port of the original inline script)
  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>(".reveal")
    if (revealElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("active")
          }
        }
      },
      { threshold: 0.1 },
    )

    revealElements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  // Nav shrink on scroll (h-20 → h-16)
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const onScroll = () => {
      if (window.scrollY > 50) {
        nav.classList.add("h-16")
        nav.classList.remove("h-20")
      } else {
        nav.classList.add("h-20")
        nav.classList.remove("h-16")
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // WebGL smoke/fog shader (FBM noise with mouse-reactive red glow + vignette)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false })
    if (!gl) return

    const VERT = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const FRAG = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      // ---- noise helpers (iq style hash + value noise + fbm) ----
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.02;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        // Slow drifting fog, layered fbm
        vec2 q = uv * vec2(1.6, 1.0);
        q += vec2(u_time * 0.04, u_time * 0.02);
        float n1 = fbm(q);
        float n2 = fbm(q + vec2(n1) + vec2(0.7, 1.3));
        float n3 = fbm(q * 1.8 - vec2(n2) * 0.6);

        // Base deep ink palette (matches the memorial shell)
        vec3 base = vec3(0.039, 0.039, 0.043);          // ~#0A0A0B
        vec3 mid  = vec3(0.078, 0.078, 0.090);          // ~#141416
        vec3 fog  = mix(base, mid, smoothstep(0.2, 0.9, n3));

        // Mouse-reactive red glow (soft, additive)
        vec2 m = u_mouse;
        float d = distance(uv, m);
        float glow = exp(-d * 5.5) * 0.55;
        vec3 red = vec3(0.890, 0.024, 0.075);           // ~#E30613
        fog += red * glow;

        // Subtle horizontal sweep for a sense of motion
        float sweep = sin(uv.x * 3.14159 + u_time * 0.15) * 0.015;
        fog += vec3(sweep);

        // Vignette
        float vig = smoothstep(1.2, 0.35, length(uv - 0.5));
        fog *= mix(0.55, 1.0, vig);

        gl_FragColor = vec4(fog, 1.0);
      }
    `

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)
      if (!s) return null
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("shader compile error:", gl.getShaderInfoLog(s))
        gl.deleteShader(s)
        return null
      }
      return s
    }

    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("program link error:", gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    // Fullscreen triangle
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    const aPos = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, "u_resolution")
    const uTime = gl.getUniformLocation(program, "u_time")
    const uMouse = gl.getUniformLocation(program, "u_mouse")

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1 - (e.clientY - rect.top) / rect.height,
      }
    }
    window.addEventListener("mousemove", onMouseMove)

    const start = performance.now()
    let rafId = 0
    const render = () => {
      const t = (performance.now() - start) / 1000
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, t)
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      rafId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", onMouseMove)
      ro.disconnect()
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [pathname])

  // The homepage has its own dedicated shell (video bg + security scripts).
  // Pass children through untouched so /home-client.tsx remains the source of truth.
  if (isHome) return <>{children}</>

  return (
    <div className="memorial-scope">
      {/* WebGL smoke/fog background */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
      />

      {/* Red accents */}
      <div className="red-bar-left hidden md:block" />
      <div className="red-bar-right hidden md:block" />
      <div className="red-dot-top-right" />

      {/* Fixed memorial nav */}
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-50 bg-mn-surface/80 backdrop-blur-md border-b border-mn-border-subtle h-20 transition-all duration-500"
      >
        <div className="flex justify-between items-center w-full px-mn-margin-desktop max-w-screen-2xl mx-auto h-full">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-mn-headline-md text-mn-headline-md text-mn-primary tracking-tight"
            >
              স্মৃতিসৌধ
            </Link>
            <div className="hidden md:flex gap-6 items-center">
              {NAV_LINKS.map((l) => {
                const active = pathname.startsWith(l.href)
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={
                      "font-mn-label-md text-mn-label-md transition-colors duration-300 " +
                      (active
                        ? "text-mn-primary border-b border-mn-primary pb-1"
                        : "text-mn-on-surface-variant hover:text-mn-primary")
                    }
                  >
                    {l.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="material-symbols-outlined text-mn-on-surface hover:opacity-70 transition-opacity"
              aria-label="Search"
            >
              search
            </button>
            <Link
              href="/aid"
              className="bg-mn-primary text-mn-on-primary px-6 py-2 font-mn-label-md text-mn-label-md uppercase tracking-widest hover:bg-opacity-90 transition-all"
            >
              অনুদান
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-20">{children}</main>

      {/* Footer */}
      <footer className="w-full py-mn-section-gap border-t border-mn-border-subtle bg-mn-surface-deep/80 backdrop-blur-md reveal relative mt-mn-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-mn-gutter px-mn-margin-desktop max-w-screen-2xl mx-auto">
          <div className="md:col-span-4">
            <h2 className="font-mn-headline-md text-mn-headline-md text-mn-tertiary mb-6">
              স্মৃতিসৌধ
            </h2>
            <p className="font-mn-body-md text-mn-body-md text-mn-text-dim">
              এটি একটি অরাজনৈতিক আর্কাইভ প্রজেক্ট যা ২০২৪ সালের জুলাই মাসের
              গণঅভ্যুত্থানের ইতিহাসকে সংরক্ষণ করার জন্য নিবেদিত।
            </p>
          </div>
          <div className="md:col-span-2" />
          <div className="md:col-span-2">
            <h4 className="font-mn-label-caps text-mn-label-caps text-mn-july-red mb-6">
              নেভিগেশন
            </h4>
            <ul className="space-y-4">
              {NAV_LINKS.slice(0, 3).map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-mn-label-caps text-mn-label-caps text-mn-july-red mb-6">
              সামাজিক
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  ফেসবুক
                </a>
              </li>
              <li>
                <a
                  className="font-mn-label-md text-mn-label-md text-mn-text-dিম hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  টুইটার
                </a>
              </li>
              <li>
                <a
                  className="font-mn-label-md text-mn-label-md text-mn-text-dিম hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  ইনস্টাগ্রাম
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-mn-label-caps text-mn-label-caps text-mn-july-red mb-6">
              নীতিমালা
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  className="font-mn-label-md text-mn-label-md text-mn-text-dিম hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  গোপনীয়তা নীতি
                </a>
              </li>
              <li>
                <a
                  className="font-mn-label-md text-mn-label-md text-mn-text-dিম hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  যোগাযোগ
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-20 px-mn-margin-desktop max-w-screen-2xl mx-auto border-t border-mn-border-subtle pt-8 text-center md:text-left flex justify-between items-center">
          <p className="font-mn-body-md text-mn-body-md text-mn-text-dিম">
            © ২০২৪ স্মৃতিসৌধ আর্কাইভ। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="w-8 h-8 bg-mn-july-red rounded-full" />
        </div>
      </footer>
    </div>
  )
}