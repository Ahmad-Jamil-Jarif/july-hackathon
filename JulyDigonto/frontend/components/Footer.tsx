"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full py-mn-section-gap border-t border-mn-border-subtle bg-mn-surface-deep/80 backdrop-blur-md reveal relative mt-mn-section-gap">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-mn-gutter px-mn-margin-desktop max-w-screen-2xl mx-auto">
        <div className="md:col-span-4">
          <h2 className="font-mn-headline-md text-mn-headline-md text-mn-tertiary mb-6">স্মৃতিসৌধ</h2>
          <p className="font-mn-body-md text-mn-body-md text-mn-text-dim">এটি একটি অরাজনৈতিক আর্কাইভ প্রজেক্ট যা ২০২৪ সালের জুলাই মাসের গণঅভ্যুত্থানের ইতিহাসকে সংরক্ষণ করার জন্য নিবেদিত।</p>
        </div>
        <div className="md:col-span-2" />
        <div className="md:col-span-2">
          <h4 className="font-mn-label-caps text-mn-label-caps text-mn-july-red mb-6">নেভিগেশন</h4>
          <ul className="space-y-4">
            <li><Link href="/" className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors">সংগ্রহশালা</Link></li>
            <li><Link href="/" className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors">শহীদ তালিকা</Link></li>
            <li><Link href="/" className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors">ইতিহাস</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-mn-label-caps text-mn-label-caps text-mn-july-red mb-6">সামাজিক</h4>
          <ul className="space-y-4">
            <li><a className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors" href="#">ফেসবুক</a></li>
            <li><a className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors" href="#">টুইটার</a></li>
            <li><a className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors" href="#">ইনস্টাগ্রাম</a></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-mn-label-caps text-mn-label-caps text-mn-july-red mb-6">নীতিমালা</h4>
          <ul className="space-y-4">
            <li><a className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors" href="#">গোপনীয়তা নীতি</a></li>
            <li><a className="font-mn-label-md text-mn-label-md text-mn-text-dim hover:text-mn-tertiary transition-colors" href="#">যোগাযোগ</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-20 px-mn-margin-desktop max-w-screen-2xl mx-auto border-t border-mn-border-subtle pt-8 text-center md:text-left flex justify-between items-center">
        <p className="font-mn-body-md text-mn-body-md text-mn-text-dim">© ২০২৪ স্মৃতিসৌধ আর্কাইভ। সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="w-8 h-8 bg-mn-july-red rounded-full" />
      </div>
    </footer>
  )
}
