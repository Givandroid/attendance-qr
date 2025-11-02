'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, QrCode as QrIcon } from 'lucide-react'

export default function QRCodeDisplay({ 
  url, 
  title, 
  sessionData 
}: { 
  url: string; 
  title: string;
  sessionData?: {
    date?: string;
    time?: string;
    location?: string;
    coordinator?: string;
  }
}) {
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
    const qrCanvas = canvasRef.current
    if (!qrCanvas) return

    const finalCanvas = document.createElement('canvas')
    const ctx = finalCanvas.getContext('2d')
    if (!ctx) return

    // A4 Portrait - 200 DPI
    const width = 1654
    const height = 2339
    const margin = 150
    const contentWidth = width - (margin * 2)

    finalCanvas.width = width
    finalCanvas.height = height

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    let y = margin + 50

    // ===== HEADER =====
    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 60px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(title, width / 2, y)

    y += 90

    ctx.fillStyle = '#64748b'
    ctx.font = '30px system-ui, -apple-system, sans-serif'
    ctx.fillText('QR Code Absensi', width / 2, y)

    y += 80

    // Divider
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(margin + 200, y)
    ctx.lineTo(width - margin - 200, y)
    ctx.stroke()

    y += 100

    // ===== QR CODE =====
    const qrSize = 550
    const qrX = (width - qrSize) / 2

    // QR Border
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 3
    ctx.strokeRect(qrX - 20, y - 20, qrSize + 40, qrSize + 40)

    ctx.drawImage(qrCanvas, qrX, y, qrSize, qrSize)

    y += qrSize + 100

    // ===== SESSION INFO =====
    if (sessionData && Object.values(sessionData).some(v => v)) {
      // Section header
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 40px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Informasi Sesi', width / 2, y)

      y += 70

      // Info container
      const containerPadding = 80
      const containerX = margin + containerPadding
      const containerWidth = contentWidth - (containerPadding * 2)
      
      const dataEntries = Object.entries(sessionData).filter(([_, v]) => v)
      const rowHeight = 65
      const containerHeight = (dataEntries.length * rowHeight) + 80
      const radius = 20
      
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.moveTo(containerX + radius, y)
      ctx.lineTo(containerX + containerWidth - radius, y)
      ctx.quadraticCurveTo(containerX + containerWidth, y, containerX + containerWidth, y + radius)
      ctx.lineTo(containerX + containerWidth, y + containerHeight - radius)
      ctx.quadraticCurveTo(containerX + containerWidth, y + containerHeight, containerX + containerWidth - radius, y + containerHeight)
      ctx.lineTo(containerX + radius, y + containerHeight)
      ctx.quadraticCurveTo(containerX, y + containerHeight, containerX, y + containerHeight - radius)
      ctx.lineTo(containerX, y + radius)
      ctx.quadraticCurveTo(containerX, y, containerX + radius, y)
      ctx.closePath()
      ctx.fill()
      
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 2
      ctx.stroke()

      y += 50

      const icons: Record<string, string> = {
        date: '📅',
        time: '⏰',
        location: '📍',
        coordinator: '👤'
      }

      const labels: Record<string, string> = {
        date: 'Tanggal',
        time: 'Waktu',
        location: 'Lokasi',
        coordinator: 'Koordinator'
      }

      const iconX = containerX + 50
      const labelX = iconX + 80
      const valueX = containerX + containerWidth - 50

      dataEntries.forEach(([key, value]) => {
        const baselineY = y + 35

        // Icon 
        ctx.font = '36px system-ui'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#0f172a'
        ctx.fillText(icons[key] || '•', iconX, baselineY)

        // Label
        ctx.font = '30px system-ui, -apple-system, sans-serif'
        ctx.fillStyle = '#64748b'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(labels[key] || key, labelX, baselineY)

        // Value
        ctx.font = 'bold 30px system-ui, -apple-system, sans-serif'
        ctx.fillStyle = '#0f172a'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(value, valueX, baselineY)

        y += rowHeight
      })

      y += 50
    }

    // ===== FOOTER =====
    y = height - margin - 120

    ctx.fillStyle = '#64748b'
    ctx.font = '26px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Scan QR code di atas untuk melakukan absensi', width / 2, y)

    y += 70

    // Bottom divider
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(margin + 200, y)
    ctx.lineTo(width - margin - 200, y)
    ctx.stroke()

    // Download
    const link = document.createElement('a')
    link.download = `QR-${title.replace(/\s+/g, '_')}.png`
    link.href = finalCanvas.toDataURL('image/png', 1.0)
    link.click()
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