import React from 'react'
import QRCode from 'qrcode.react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface QRCodeGeneratorProps {
  url: string
  size?: number
}

export function QRCodeGenerator({ url, size = 256 }: QRCodeGeneratorProps) {
  const downloadQR = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/milton')
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = 'qr-code.png'
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <QRCode id="qr-code" value={url} size={size} level="H" />
        <Button onClick={downloadQR} className="mt-4">
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  )
}