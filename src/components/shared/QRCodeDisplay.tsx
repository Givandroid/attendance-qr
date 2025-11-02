'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, QrCode as QrIcon } from 'lucide-react'

export default function QRCodeDisplay({ url, title }: { url: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      })
    }
  }, [url])

  const downloadQR = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const link = document.createElement('a')
      link.download = `QR-${title.replace(/\s+/g, '_')}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <Card className="p-6 border border-gray-200 rounded-2xl bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <QrIcon className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-bold text-gray-900">QR Code Absensi</h3>
      </div>
      
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 mb-4">
        <canvas ref={canvasRef} className="mx-auto" />
      </div>

      <p className="text-sm text-gray-600 mb-4 text-center">
        Scan QR code untuk melakukan absensi
      </p>

      <Button
        onClick={downloadQR}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl hover:scale-[1.02] transition-all duration-300"
      >
        <Download className="w-4 h-4 mr-2" />
        Download QR Code
      </Button>
    </Card>
  )
}