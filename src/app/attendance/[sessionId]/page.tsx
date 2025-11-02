'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Session } from '@/types'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import SignaturePad from '@/components/attendance/SignaturePad'
import { CheckCircle, Calendar, MapPin, Clock, UserCheck, Building, Briefcase, Phone } from 'lucide-react'

export default function AttendancePage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [signature, setSignature] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    institution: '',
    position: '',
    phone_number: ''
  })

  useEffect(() => {
    fetchSession()
  }, [])

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', params.sessionId)
        .eq('is_active', true)
        .single()

      if (error) throw error
      setSession(data)
    } catch (error) {
      alert('❌ Sesi tidak ditemukan atau sudah ditutup')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!signature) {
      alert('Silakan tanda tangan terlebih dahulu')
      return
    }

    if (!form.full_name || !form.institution || !form.position || !form.phone_number) {
      alert('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('attendances')
        .insert([{
          session_id: params.sessionId,
          ...form,
          signature
        }])

      if (error) throw error

      setSuccess(true)
      setTimeout(() => router.push('/'), 3000)
    } catch (error) {
      alert('❌ Gagal melakukan absensi')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Memuat sesi...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-12 text-center max-w-md border-0 shadow-2xl rounded-3xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Absensi Berhasil!
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Terima kasih sudah melakukan absensi
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto" />
        </Card>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Form Absensi</h1>
              <p className="text-sm text-gray-500">Isi data Anda dengan lengkap</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Session Info Card */}
        <Card className="p-8 mb-8 border border-gray-200 rounded-2xl bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {session.title}
              </h2>
              {session.description && (
                <p className="text-gray-600 leading-relaxed mb-4">
                  {session.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {session.location && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Lokasi</p>
                  <p className="font-medium">{session.location}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Waktu</p>
                <p className="font-medium">
                  {new Date(session.start_time).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="p-8 border border-gray-200 rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Data Peserta</h3>

          <div className="space-y-6">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Nama Lengkap *
              </Label>
              <Input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Masukkan nama lengkap Anda"
                className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl h-12 px-4 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Instansi */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                Instansi / Perusahaan *
              </Label>
              <Input
                required
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                placeholder="Nama instansi atau perusahaan"
                className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl h-12 px-4 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Jabatan */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Jabatan *
              </Label>
              <Input
                required
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="Jabatan Anda"
                className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl h-12 px-4 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Nomor Telepon */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Nomor Telepon *
              </Label>
              <Input
                required
                type="tel"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl h-12 px-4 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Signature Pad */}
            <SignaturePad onSave={setSignature} />

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.full_name || !form.institution || !form.position || !form.phone_number || !signature}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan absensi...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit Absensi</span>
                </div>
              )}
            </Button>

            <p className="text-sm text-gray-500 text-center">
              * Wajib diisi
            </p>
          </div>
        </Card>
      </main>
    </div>
  )
}