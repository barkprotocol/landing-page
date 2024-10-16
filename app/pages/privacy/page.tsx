"use client";

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Milton Protocol',
  description: 'Learn about how Milton Protocol collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-lg mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Milton Protocol ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="mb-4">We collect information that you provide directly to us, such as when you create an account, use our services, or communicate with us. This may include:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Personal information (e.g., name, email address, wallet address)</li>
            <li>Transaction data</li>
            <li>Communication data</li>
            <li>Usage data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect for various purposes, including:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Providing, maintaining, and improving our services</li>
            <li>Processing transactions and sending related information</li>
            <li>Communicating with you about our services</li>
            <li>Detecting, preventing, and addressing technical issues</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p className="mb-4">
            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. Please contact us if you wish to exercise these rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
          <p className="mb-4">
            Our services may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to read the privacy policies of any third-party sites you visit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at privacy@miltonprotocol.com.
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