import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const TermsOfUsePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Terms of Use - Milton Protocol</title>
        <meta name="description" content="Terms of Use for Milton Protocol" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Milton Protocol website and services, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p>
                Milton Protocol provides a blockchain-based platform for creating and managing digital assets. Our services include, but are not limited to, token creation, asset management, and decentralized finance features.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              <p>
                Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
              <p>
                All content on the Milton Protocol website, including text, graphics, logos, and software, is the property of Milton Protocol or its content suppliers and is protected by international copyright laws.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p>
                Milton Protocol shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
              <p>
                These Terms of Use shall be governed by and construed in accordance with the laws of the jurisdiction in which Milton Protocol is registered, without regard to its conflict of law provisions.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Use at any time. We will provide notice of any material changes by posting the new Terms of Use on this page.
              </p>
            </section>
          </div>
          <div className="mt-12">
            <Link href="/legal" className="text-secondary hover:text-primary transition-colors">
              Back to Legal Information
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default TermsOfUsePage