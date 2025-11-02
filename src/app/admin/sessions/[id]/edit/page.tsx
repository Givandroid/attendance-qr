'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Session } from '@/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import EditSessionForm from '@/components/admin/EditSessionForm'

export default function EditSessionPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSession()
  }, [])

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setSession(data)
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Sesi tidak ditemukan')
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Memuat data sesi...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/admin/sessions/${params.id}`)}
              className="hover:bg-gray-100 rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </Button>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Edit Sesi</h1>
              <p className="text-sm text-gray-500">Update informasi sesi rapat</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <EditSessionForm
          session={session}
          onSuccess={() => router.push(`/admin/sessions/${params.id}`)}
          onCancel={() => router.push(`/admin/sessions/${params.id}`)}
        />
      </main>
    </div>
  )
}