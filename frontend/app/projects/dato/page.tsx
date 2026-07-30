import Link from 'next/link'

export default function DatoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dato Contra Relato</h1>
      <p className="mb-4">
        Dato Contra Relato is an automated pipeline for fact-checking political speeches in video.
        It takes a URL (YouTube, TikTok, Instagram Reels) and produces an HTML report with each
        factual claim checked against official sources.
      </p>
      <h2 className="text-xl font-bold mb-2">Integration Status</h2>
      <p className="mb-4">
        The backend pipeline has been integrated into the JulyNexus API at <code>/api/v1/factcheck/run) and is ready to use.
        The frontend for this project is not yet integrated. You can test the API directly.
      </p>
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">API Endpoint</h3>
        <p class="language>es</span>
                  <span className="px-2">/</span>
                  <span className="font-semibold">model_size</span>: <span className="font-semibold">large-v3</span>
                </code>
              </p>
            </div>
          </div>
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
