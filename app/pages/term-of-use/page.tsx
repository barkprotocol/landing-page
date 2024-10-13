import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use | Milton Protocol',
  description: 'Read the terms and conditions for using Milton Protocol services.',
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
        <p className="text-lg mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using the Milton Protocol website and services, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Milton Protocol provides a blockchain-based platform for creating and managing digital assets. Our services include, but are not limited to, token creation, asset management, and decentralized finance features.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <p className="mb-4">
            Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
          <p className="mb-4">
            All content on the Milton Protocol website, including text, graphics, logos, and software, is the property of Milton Protocol or its content suppliers and is protected by international copyright laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
          <p className="mb-4">
            Milton Protocol shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. User Content</h2>
          <p className="mb-4">
            You retain all rights to any content you submit, post or display on or through the service. By submitting, posting or displaying content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate and distribute such content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms of Use at any time. We will provide notice of any material changes by posting the new Terms of Use on this page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at legal@miltonprotocol.com.
          </p>
        </section>

        <div className="mt-12">
          <Link href="/legal" className="text-secondary hover:text-primary transition-colors">
            Back to Legal Information
          </Link>
        </div>
      </div>
    </div>
  )
}