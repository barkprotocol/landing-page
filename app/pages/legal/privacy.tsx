import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const PrivacyPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Milton Protocol</title>
        <meta name="description" content="Privacy Policy for Milton Protocol" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                Milton Protocol ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, such as when you create an account, use our services, or communicate with us. This may include:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Personal information (e.g., name, email address, wallet address)</li>
                <li>Transaction data</li>
                <li>Communication data</li>
                <li>Usage data</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p>
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Providing, maintaining, and improving our services</li>
                <li>Processing transactions and sending related information</li>
                <li>Communicating with you about our services</li>
                <li>Detecting, preventing, and addressing technical issues</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. Please contact us if you wish to exercise these rights.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@miltonprotocol.com.
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

export default PrivacyPage