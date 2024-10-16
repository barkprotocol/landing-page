"use client";

import { MiltonServices, MiltonInfo } from '@/components/services/milton'
import { Toaster } from "@/components/ui/toaster"

export default function MiltonServicesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Milton Protocol Services</h1>
      <div className="flex flex-col items-center justify-center">
        <MiltonServices />
        <MiltonInfo />
      </div>
      <Toaster />
    </div>
  )
}