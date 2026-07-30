import Link from 'next/link'

export default function Projects() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Integrated Projects</h1>
      <div className="space-y-4">
        <Link href="/projects/dato" className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
          Dato Contra Relato - Automated Political Video Fact-Checking
        </Link>
        <Link href="/projects/heard" className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
          Heard - Civic Engagement Platform
        </Link>
        <Link href="/projects/sohojatra" className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
          SohoJatra - Community Engagement Platform
        </Link>
        <Link href="/projects/trustsetu" className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
          TrustSetu - AI Credibility Analysis
        </Link>
        <Link href="/projects/ai-engine" className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
          AI Engine - Forensics and Analysis
        </Link>
      </div>
    </div>
  )
}
