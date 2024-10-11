'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: "What is Milton Token (MILTON)?",
    answer: "MILTON is a meme-powered token built on the Solana blockchain, combining lightning-fast transactions with hilarious meme culture."
  },
  {
    question: "How do I earn MILTON tokens?",
    answer: "You can earn MILTON tokens by creating and sharing memes, participating in our NFT marketplace, or staking your tokens in our DeFi platforms."
  },
  {
    question: "Is Milton Token secure?",
    answer: "Yes, Milton Token leverages the security and speed of the Solana blockchain, ensuring safe and rapid transactions for all your meme-based finances."
  },
  {
    question: "How can I buy MILTON tokens?",
    answer: "MILTON tokens can be purchased on various Solana-based decentralized exchanges. Check our website for the latest list of supported platforms."
  },
  {
    question: "What makes Milton Token unique?",
    answer: "Milton Token combines the power of memes with cutting-edge blockchain technology, creating a fun and engaging ecosystem for crypto enthusiasts and meme lovers alike."
  },
  {
    question: "How can I participate in Milton's community governance?",
    answer: "Token holders can participate in our DAO by creating meme proposals and voting on community decisions. The most upvoted meme proposals win!"
  }
]

function AccordionItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex justify-between items-center w-full py-6 text-left text-gray-800 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-300"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="text-xl font-semibold">{question}</span>
        <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-primary' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="py-4 px-4 text-gray-600 text-lg leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-4xl font-bold text-center text-gray-900 mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <AccordionItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}