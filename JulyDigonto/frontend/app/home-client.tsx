"use client"

import { useEffect, useRef } from "react"

type Martyr = {
  name: string
  location: string
  date: string
  img: string
  delayMs: number
}

const MARTYRS: Martyr[] = [
  {
    name: "আবু সাঈদ",
    location: "রংপুর",
    date: "১৬ জুলাই",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwYTseK2iC-6gmCvdjPIDp8HA8FAGJQQjxdJHG37Of_6BM78MXIVgvENCpgUwsVB7UJmBTP3J6L-NacTDrDgY62BF05MMQOu5Xvkv5FUVyvANeVm0Yoj9w0iZCCjKGHYKyNscZS_whpndLfzAoKyeEFDppnHkGK0Eh1XStGBqCeL6TV7GU3OWJgPnWtOUIWFSqOcmzql-BdKrL9gFJ-uKgn5VNEeitoC1mTpxGI7Bi9cX1_UrxQ29I",
    delayMs: 100,
  },
  {
    name: "মুগ্ধ",
    location: "ঢাকা",
    date: "১৮ জুলাই",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4B_QTbnzBUh9SgnrP3AYLyBFgw-DBYolNl4_ZbTcnjMyOewhXgx6-FLByL7NNlgTg4wFFkkxxEowB5wR6rp6cF52JpJG0XlTbC_gxRCs4SAgOmvAbOIgXfZTc4lJUH366tTW41abWKTIy6H_ORxHDBFZ5EpN4OoD2ha2u9Uz24Rz7dU_o1wOjIfBiTBv-n7cdXrKa7xZjYlcT9hGtQbqo5z4ejQiZPR94w0ka3ABp9RJx_8l-g-b1",
    delayMs: 200,
  },
  {
    name: "ফারহান",
    location: "ঢাকা",
    date: "১৯ জুলাই",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkKAKSDTBMOArRvybxNFJLtRtK6mr6IdnKK1DWecPDaR3u8jp50cr1I6-FU7f_TxwU3ibw2X31TxC3PmYVlFUPzOVDImOcKJHR6rtIx_ADml-EAnow39WHEmiKUP1_O-VUwF97GL2PNJcGGZyQsErisRwl63ZO3B0JrXuJZbc8qZt6_wuvmKqewyNL187-Q1V-isIxfv21MPbHspBk_IZUmsh38cwpHkD-r4TgbEpJkkH8E8SVVy2h",
    delayMs: 300,
  },
  {
    name: "সজিব",
    location: "যাত্রাবাড়ী",
    date: "২০ জুলাই",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwXZ1SKKc8nMHVRvLGjFclTbP8xmEgLDroKr3YQFo2VZf_ZPrHk-uoFbBuOWnu0DjA4SuyYc5xa2DJxyeV23PnvH__zR51dmxf-8Qtxf2hdQO6-UAuC8wcyZwqrD1DnRCRaOgeX0PPA97iC3oTX-ffHiWfJjLAl_10vi-_fgIcBXc5FWJBptUVLCEeqBR9WcF8dOlT23srQYqO5xtA_LTeUEUsInmGNYd0U6MekVpCl5AVN8LzSneP",
    delayMs: 400,
  },
  {
    name: "ইমন",
    location: "সাভার",
    date: "২১ জুলাই",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkEeRVKQp3ai2eT0uQbcSBsZFFVDCZOcp_TvAjQiYJvVzaUPiyXsRLBprGlgSzOlIoDAiYRQVm8tsCW1Vf012yI2SQWVufCsbxLBh4I80htuSz9a1-K0nCVoAszBFhnCz9s6uYP1xU7VR3s_ob1BzTLUzuTUnGtc7NviEdk98WrHzngVSl-YvAcBtQTYozmIE1CWlYwT8LPdEDz0i_SotnsREwVUAXeWRyyn3Q-D4DT7C5kxbon_vb",
    delayMs: 500,
  },
  {
    name: "রাফি",
    location: "চট্টগ্রাম",
    date: "২২ জুলাই",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJOLK2UxXUagLwHbnvLEUQXnxxBBLEm9JtPXTILUS6dGxmun0on9Wm7oyH-iPsda4Cf7w-pRWUoSYRfBSJpWcYGOz9JehsMzqNrplMGPwB4a9dAnNqLSAtJI8cEt9PZEKpkZUMZTZYD3SIASL-y-puFwSrckfmOWO71CdCcot1mr3WZHeow476EmJ546Zx99eTHOQFwJa8uWrihCpGHmzb1Fw8FXsj-mrNJtzPUSfX-2Quk5WYz36i",
    delayMs: 600,
  },
]

type TimelineEvent = {
  date: string
  title: string
  body: string
}

const TIMELINE: TimelineEvent[] = [
  {
    date: "১৬ জুলাই ২০২৪",
    title: "প্রথম রক্তপাত",
    body: "রংপুরে পুলিশের গুলিতে আবু সাঈদের শাহাদাত বরণ। দেশজুড়ে তীব্র ক্ষোভের বিস্ফোরণ।",
  },
  {
    date: "১৮ জুলাই ২০২৪",
    title: "শাটডাউন ও অবরোধ",
    body: "শিক্ষার্থীদের ঘোষিত 'কমপ্লিট শাটডাউন' পালিত। ঢাকার বিভিন্ন স্থানে ভয়াবহ সংঘর্ষ।",
  },
  {
    date: "৫ আগস্ট ২০২৪",
    title: "বিজয় মিছিল",
    body: "ছাত্র-জনতার গণঅভ্যুত্থানে স্বৈরশাসনের অবসান। গণভবন অভিমুখে লাখো মানুষের পদযাত্রা।",
  },
]

export function HomeClient() {
  const navRef = useRef<HTMLElement>(null)

  // Security scripts (right-click block, devtools key combo block, devtools open detect)
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault()
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey &&
          e.shiftKey &&
          (e.keyCode === 73 ||
            e.keyCode === 74 ||
            e.keyCode === 67)) || // Ctrl+Shift+I/J/C
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
        (e.ctrlKey && e.keyCode === 83) // Ctrl+S
      ) {
        e.preventDefault()
      }
    }
    const interval = window.setInterval(() => {
      if (window.outerWidth - window.innerWidth > 160) {
        window.location.reload()
      }
    }, 1000)

    document.addEventListener("contextmenu", onContextMenu)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("contextmenu", onContextMenu)
      document.removeEventListener("keydown", onKeyDown)
      window.clearInterval(interval)
    }
  }, [])

  // Reveal-on-scroll animation via IntersectionObserver
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
  }, [])

  // Nav shrink on scroll
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

  return (
    <div className="memorial-scope">
      {/* Background video */}
      <video
        autoPlay
        className="fixed inset-0 w-full h-full object-cover -z-50 pointer-events-none"
        loop
        muted
        playsInline
      >
        <source
          src="https://july36.gov.bd/assets/frontend/videos/popup-video.mp4"
          type="video/mp4"
        />
      </video>
      <div className="fixed inset-0 w-full h-full bg-black/40 -z-40 pointer-events-none" />

      {/* Red accents */}
      <div className="red-bar-left hidden md:block" />
      <div className="red-bar-right hidden md:block" />
      <div className="red-dot-top-right" />

      {/* Nav */}
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-50 bg-mn-surface/80 backdrop-blur-md border-b border-mn-border-subtle h-20 transition-all duration-500"
      >
        <div className="flex justify-between items-center w-full px-mn-margin-desktop max-w-screen-2xl mx-auto h-full">
          <div className="flex items-center gap-8">
            <a
              className="font-mn-headline-md text-mn-headline-md text-mn-primary tracking-tight"
              href="#"
            >
              স্মৃতিসৌধ
            </a>
            <div className="hidden md:flex gap-6 items-center">
              <a
                className="font-mn-label-md text-mn-label-md text-mn-primary border-b border-mn-primary pb-1"
                href="#"
              >
                সংগ্রহশালা
              </a>
              <a
                className="font-mn-label-md text-mn-label-md text-mn-on-surface-variant hover:text-mn-primary transition-colors duration-300"
                href="#"
              >
                শহীদ তালিকা
              </a>
              <a
                className="font-mn-label-md text-mn-label-md text-mn-on-surface-variant hover:text-mn-primary transition-colors duration-300"
                href="#"
              >
                ইতিহাস
              </a>
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
            <button
              type="button"
              className="bg-mn-primary text-mn-on-primary px-6 py-2 font-mn-label-md text-mn-label-md uppercase tracking-widest hover:bg-opacity-90 transition-all"
            >
              অনুদান
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex flex-col justify-center items-center px-mn-margin-mobile text-center relative pt-20">
          <div className="reveal">
            <div className="hero-logo-box mb-12">
              <div className="flex flex-col items-center">
                <div className="text-8xl bengali-text-bold tracking-tighter">
                  জুলাই
                </div>
                <div className="flex items-end gap-2 mt-[-10px]">
                  <div className="text-8xl bengali-text-bold bengali-text-red">
                    ৩৬
                  </div>
                  <div className="text-left font-bold text-black leading-tight pb-2">
                    <div className="text-xl">গণ</div>
                    <div className="text-xl">অভ্যুত্থান</div>
                    <div className="text-xl">স্মৃতি</div>
                    <div className="text-xl">জাদুঘর</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto mt-8">
              <p className="font-mn-headline-md text-2xl italic leading-relaxed mb-6">
                &ldquo;The struggle of people against power
                <br />
                is the struggle
                <br />
                of memory against forgetting.&rdquo;
              </p>
              <p className="font-mn-body-lg text-mn-text-dim text-lg leading-relaxed max-w-xl mx-auto">
                The July Mass Uprising Memorial Museum has been established to
                document the 16 years of Fascist Hasina&apos;s tyranny and to
                commemorate the July Uprising for generations to come.
              </p>
            </div>
            <div className="red-dot-bottom-center" />
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 reveal delay-400">
            <a
              className="flex flex-col items-center gap-2 text-mn-text-dim hover:text-mn-primary transition-colors group"
              href="#faces"
            >
              <span className="font-mn-label-caps text-[10px]">
                SCROLL TO EXPLORE
              </span>
              <span className="material-symbols-outlined animate-bounce">
                expand_more
              </span>
            </a>
          </div>
        </section>

        {/* Faces */}
        <section
          className="py-mn-section-gap px-mn-margin-desktop max-w-screen-2xl mx-auto"
          id="faces"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 reveal">
            <div>
              <span className="font-mn-label-caps text-mn-label-caps text-mn-july-red mb-4 block">
                FACES OF THE UPRISING
              </span>
              <h2 className="font-mn-headline-lg text-mn-headline-lg">
                অমর এই প্রাণেরা
              </h2>
            </div>
            <p className="font-mn-body-md text-mn-body-md text-mn-text-dim max-w-md">
              যারা অন্যায়ের প্রতিবাদে বুক চিতিয়ে দাঁড়িয়েছিলেন, তাঁদের
              প্রত্যেকের নাম ও পরিচয় আমরা সযত্নে লালন করি।
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-mn-gutter">
            {MARTYRS.map((m) => (
              <div
                key={m.name}
                className="group reveal"
                style={{ transitionDelay: `${m.delayMs}ms` }}
              >
                <div className="aspect-[3/4] bg-mn-surface-muted overflow-hidden border border-mn-border-subtle group-hover:border-mn-july-red transition-all">
                  <img
                    alt={`${m.name} Memorial`}
                    className="w-full h-full object-cover grayscale-hover"
                    src={m.img}
                  />
                </div>
                <div className="mt-4">
                  <p className="font-mn-label-caps text-mn-label-caps text-mn-primary">
                    {m.name}
                  </p>
                  <p className="font-mn-body-md text-mn-body-md text-mn-text-dim">
                    {m.location}, {m.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="py-mn-section-gap bg-mn-surface-deep/80 backdrop-blur-md relative">
          <div className="px-mn-margin-desktop max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-20">
            <div className="w-full md:w-1/3 reveal">
              <span className="font-mn-label-caps text-mn-label-caps text-mn-july-red mb-4 block">
                RESISTANCE TIMELINE
              </span>
              <h2 className="font-mn-headline-lg text-mn-headline-lg mb-8">
                সংগ্রামের দিনলিপি
              </h2>
              <p className="font-mn-body-md text-mn-body-md text-mn-text-dim">
                প্রতিটি দিন ছিল এক একটি ইতিহাস। মিছিল থেকে মুক্তি পর্যন্ত
                প্রতিটি পদক্ষেপের কালানুক্রমিক বিবরণ।
              </p>
            </div>
            <div className="w-full md:w-2/3 relative">
              <div className="absolute left-0 top-0 bottom-0 timeline-line ml-[4px]" />
              <div className="space-y-16 pl-12">
                {TIMELINE.map((evt) => (
                  <div key={evt.date} className="relative reveal">
                    <div className="absolute -left-[51px] top-2 w-3 h-3 bg-mn-july-red rounded-full ring-8 ring-mn-surface-deep" />
                    <span className="font-mn-label-caps text-mn-label-caps text-mn-primary">
                      {evt.date}
                    </span>
                    <h3 className="font-mn-headline-md text-mn-headline-md mt-2">
                      {evt.title}
                    </h3>
                    <p className="font-mn-body-md text-mn-body-md text-mn-text-dim mt-4">
                      {evt.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Archive */}
        <section className="py-mn-section-gap px-mn-margin-desktop max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-mn-gutter reveal">
            <div className="md:col-span-8 bento-card p-12 flex flex-col justify-between group">
              <div>
                <span className="font-mn-label-caps text-mn-label-caps text-mn-july-red mb-4 block">
                  VIDEO ARCHIVE
                </span>
                <h3 className="font-mn-headline-lg text-mn-headline-lg">
                  অডিও-ভিজুয়াল প্রমাণাদি
                </h3>
              </div>
              <div className="mt-12 aspect-video bg-mn-surface-container overflow-hidden relative border border-mn-border-subtle">
                <img
                  alt="Mass Protest Archive"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAj47wP5kNFyMVLAS89Kql5zAtASmICyFbeL1F6eReKb4cYEETUZow2905XQwiHnuPBDLkVTSLgC93nnxX6nPORvqrr4W840xkm0GUgw6bhu47Ige3n404bx_IHEZ_so4yqVjounym74iNOlk2hUHfM4HShfolk1jKKFUpINvAKNBOxOyOkAxBJWag-pVd6dgA5L8Xq8MrcdPfSg2dpXd-H5kS6yYyN6vKbnyQtV1KWXM6HrKyhWzF4"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    className="w-20 h-20 bg-mn-july-red/20 backdrop-blur-md rounded-full border border-mn-july-red/40 flex items-center justify-center group-hover:bg-mn-july-red group-hover:border-none transition-all"
                    aria-label="Play archive video"
                  >
                    <span className="material-symbols-outlined text-4xl group-hover:text-white">
                      play_arrow
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 space-y-mn-gutter">
              <div className="bento-card p-10 flex flex-col justify-between h-1/2">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-3xl text-mn-july-red">
                    description
                  </span>
                  <span className="font-mn-label-caps text-mn-label-caps">
                    ৮৫০+ নথি
                  </span>
                </div>
                <h4 className="font-mn-headline-md text-mn-headline-md mt-8">
                  আইনি ও সরকারি নথি
                </h4>
                <a
                  className="font-mn-label-md text-mn-label-md uppercase tracking-widest mt-4 flex items-center gap-2 group text-mn-july-red"
                  href="#"
                >
                  দেখুন{" "}
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </a>
              </div>
              <div className="bento-card p-10 flex flex-col justify-between h-1/2">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-3xl text-mn-july-red">
                    record_voice_over
                  </span>
                  <span className="font-mn-label-caps text-mn-label-caps">
                    ১২০+ সাক্ষাৎকার
                  </span>
                </div>
                <h4 className="font-mn-headline-md text-mn-headline-md mt-8">
                  प्रत्यक্ষদর্শী বয়ান
                </h4>
                <a
                  className="font-mn-label-md text-mn-label-md uppercase tracking-widest mt-4 flex items-center gap-2 group text-mn-july-red"
                  href="#"
                >
                  শুনুন{" "}
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-mn-section-gap px-mn-margin-desktop max-w-screen-2xl mx-auto border-t border-mn-border-subtle">
          <div className="max-w-3xl mx-auto text-center reveal">
            <h2 className="font-mn-headline-lg text-mn-headline-lg mb-8">
              ইতিহাসের সাক্ষী হতে আপনার সহায়তা প্রয়োজন
            </h2>
            <p className="font-mn-body-lg text-mn-body-lg text-mn-text-dim mb-12">
              আপনার কাছে থাকা কোনো ছবি, ভিডিও বা নথি যদি থাকে যা এই
              আর্কাইভকে সমৃদ্ধ করতে পারে, দয়া করে আমাদের সাথে শেয়ার করুন।
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                type="button"
                className="bg-mn-july-red text-white px-10 py-4 font-mn-label-md text-mn-label-md uppercase tracking-widest hover:bg-opacity-90 transition-all"
              >
                সংগ্রহ জমা দিন
              </button>
              <button
                type="button"
                className="border border-mn-border-subtle px-10 py-4 font-mn-label-md text-mn-label-md uppercase tracking-widest hover:bg-mn-surface-muted transition-all backdrop-blur-md"
              >
                যোগাযোগ করুন
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-mn-section-gap border-t border-mn-border-subtle bg-mn-surface-deep/80 backdrop-blur-md reveal relative">
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
              <li>
                <a
                  className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  সংগ্রহশালা
                </a>
              </li>
              <li>
                <a
                  className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  শহীদ তালিকা
                </a>
              </li>
              <li>
                <a
                  className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  ইতিহাস
                </a>
              </li>
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
                  className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  টুইটার
                </a>
              </li>
              <li>
                <a
                  className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors"
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
                  className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  গোপনীয়তা নীতি
                </a>
              </li>
              <li>
                <a
                  className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors"
                  href="#"
                >
                  যোগাযোগ
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-20 px-mn-margin-desktop max-w-screen-2xl mx-auto border-t border-mn-border-subtle pt-8 text-center md:text-left flex justify-between items-center">
          <p className="font-mn-body-md text-mn-body-md text-mn-text-dim">
            © ২০২৪ স্মৃতিসৌধ আর্কাইভ। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="w-8 h-8 bg-mn-july-red rounded-full" />
        </div>
      </footer>
    </div>
  )
}
