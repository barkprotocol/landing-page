import Link from 'next/link'

export default function LegalPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold mb-6">Legal Information</h1>
      <p className="text-lg mb-6">
        At Milton Protocol, we are committed to transparency and protecting our users' rights. Please review our legal documents to understand how we operate and protect your information.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/legal/privacy-policy" className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Privacy Policy</h2>
          <p className="text-gray-300">Learn how we collect, use, and protect your personal information.</p>
        </Link>
        <Link href="/legal/terms-of-service" className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Terms of Service</h2>
          <p className="text-gray-300">Understand the rules and regulations governing the use of our platform.</p>
        </Link>
        <Link href="/legal/cookie-policy" className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Cookie Policy</h2>
          <p className="text-gray-300">Find out how we use cookies and similar technologies on our website.</p>
        </Link>
      </div>
    </div>
  )
}