'use client'

import { useRouter } from 'next/navigation'
import SessionForm from '@/components/admin/SessionForm'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CreateSessionPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali
              </Button>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Buat Sesi Baru</h1>
              <p className="text-sm text-gray-500">Isi detail sesi rapat Anda</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <SessionForm
          onSuccess={(sessionId) => {
            router.push(`/admin/sessions/${sessionId}`)
          }}
        />
      </main>
    </div>
  )
}