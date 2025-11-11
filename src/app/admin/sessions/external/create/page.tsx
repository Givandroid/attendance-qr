'use client'

import { useRouter } from 'next/navigation'
import SessionForm from '@/components/admin/SessionForm'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CreateExternalSessionPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/')}
              className="border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>
            
            <div className="h-6 sm:h-8 w-px bg-gray-200" />
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                    Buat Sesi Rapat Instansi Luar
                  </h1>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded hidden sm:inline-block flex-shrink-0">
                    EKSTERNAL
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Isi detail sesi rapat untuk instansi eksternal
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <SessionForm
          onSuccess={(sessionId) => {
            router.push(`/admin/sessions/${sessionId}`)
          }}
        />
      </main>
    </div>
  )
}