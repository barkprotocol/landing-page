"use client";

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CTA() {
  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Join the Milton Revolution</h2>
        <p className="text-xl mb-8">
          Be part of the next generation of meme creation and sharing!
        </p>
        <Link href="/generator" passHref>
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Create Your Blink <ArrowRight className="ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  )
}