'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, QrCode, Sparkles } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="border-b border-gray-100 backdrop-blur-sm bg-white/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">QRAttend</span>
          </div>
          <Button
            onClick={() => router.push('/admin/login')}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all duration-300 rounded-lg"
          >
            Admin Login
          </Button>
        </div>
      </header>

      {/* Hero Section - Minimal & Clean */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge with hover */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8 hover:bg-blue-100 hover:border-blue-200 transition-all duration-300 cursor-default">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-sm font-medium text-blue-700">Modern Attendance System</span>
          </div>

          {/* Main Heading with gradient animation */}
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            Absensi Rapat
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Lebih Mudah
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Kelola kehadiran dengan QR code. Real-time monitoring dan laporan otomatis.
          </p>

          {/* CTA Buttons with smooth hover */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/admin/login?redirect=/admin')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
            >
              Akses Dashboard
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => router.push('/admin/login?redirect=/admin/sessions/create')}
              variant="outline"
              className="border-2 border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-blue-200 px-8 py-6 text-base rounded-xl font-medium hover:scale-105 transition-all duration-300"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Buat Sesi Rapat
            </Button>
          </div>
        </div>
      </section>

      {/* Features - Minimal Cards with smooth hover */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <Card className="p-8 border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 rounded-2xl group cursor-pointer hover:-translate-y-2">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
              <QrCode className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              QR Code Otomatis
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Generate QR code untuk setiap sesi secara otomatis dan instant
            </p>
          </Card>

          {/* Card 2 */}
          <Card className="p-8 border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 rounded-2xl group cursor-pointer hover:-translate-y-2">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              Real-time Monitoring
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Pantau kehadiran peserta secara langsung tanpa delay
            </p>
          </Card>

          {/* Card 3 */}
          <Card className="p-8 border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 rounded-2xl group cursor-pointer hover:-translate-y-2">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              Export Laporan
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Download data absensi dalam format PDF atau CSV dengan mudah
            </p>
          </Card>
        </div>
      </section>

      {/* Footer - Minimal with hover */}
      <footer className="border-t border-gray-100 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">QRAttend</span>
            </div>
            <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              © 2025 QRAttend. Built with Next.js & Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}