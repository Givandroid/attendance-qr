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
import { CheckCircle, Calendar, MapPin, Clock, UserCheck, CreditCard, Briefcase, AlertCircle, Users } from 'lucide-react'

function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'success',
  formData
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'success'
  formData?: {
    nip: string
    full_name: string
    position: string
  }
}) {
  if (!isOpen) return null

  const iconBg = type === 'danger' ? 'bg-red-100' : type === 'success' ? 'bg-green-100' : 'bg-yellow-100'
  const iconColor = type === 'danger' ? 'text-red-600' : type === 'success' ? 'text-green-600' : 'text-yellow-600'
  const buttonBg = type === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20 hover:shadow-red-500/30'
    : type === 'success'
    ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20 hover:shadow-green-500/30'
    : 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20 hover:shadow-yellow-500/30'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${iconBg}`}>
          {type === 'success' ? (
            <CheckCircle className={`w-6 h-6 ${iconColor}`} />
          ) : (
            <AlertCircle className={`w-6 h-6 ${iconColor}`} />
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>

        <p className="text-gray-600 text-center mb-4 leading-relaxed">
          {message}
        </p>

        {formData && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-2 text-sm border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-medium">NIP:</span>
              <span className="font-bold text-blue-900">{formData.nip}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-medium">Nama:</span>
              <span className="font-bold text-blue-900">{formData.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-medium">Jabatan:</span>
              <span className="font-bold text-blue-900">{formData.position}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:scale-105 rounded-xl transition-all duration-300"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-white ${buttonBg}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeAttendancePage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [signature, setSignature] = useState('')
  const [success, setSuccess] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [form, setForm] = useState({
    nip: '',
    full_name: '',
    position: ''
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
        .eq('session_type', 'employee')
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

  const handleSubmitClick = () => {
    if (!signature) {
      alert('Silakan tanda tangan terlebih dahulu')
      return
    }

    if (!form.nip || !form.full_name || !form.position) {
      alert('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('employee_attendances')
        .insert([{
          session_id: params.sessionId,
          ...form,
          signature
        }])

      if (error) throw error

      setSuccess(true)
    } catch (error) {
      alert('❌ Gagal melakukan absensi')
    } finally {
      setSubmitting(false)
    }
  }

  const formatSessionDate = () => {
    if (!session) return ''
    return new Date(session.session_date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
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
          <p className="text-gray-600 text-lg mb-2">
            Terima kasih sudah melakukan absensi
          </p>
          <p className="text-blue-600 font-semibold mb-6">
            {form.full_name} - {form.nip}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto" />
        </Card>
      </div>
    )
  }

  if (!session) return null

  return (
    <>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Konfirmasi Data Absensi"
        message="Pastikan data yang Anda masukkan sudah benar. Data tidak dapat diubah setelah submit."
        confirmText="Ya, Submit Absensi"
        cancelText="Periksa Kembali"
        type="success"
        formData={form}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Form Absensi Pegawai</h1>
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

            {/* INFO SESI */}
            <div className="grid md:grid-cols-3 gap-4">
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
              
              {/* Tanggal */}
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Tanggal</p>
                  <p className="font-medium">{formatSessionDate()}</p>
                </div>
              </div>

              {/* Waktu */}
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Waktu</p>
                  <p className="font-medium">
                    {formatTime(session.start_time)}
                    {session.end_time && ` - ${formatTime(session.end_time)}`} WIB
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Form Card */}
          <Card className="p-8 border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Data Pegawai</h3>

            <div className="space-y-6">
              {/* NIP */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Nomor Induk Pegawai (NIP) <span className="text-red-600">*</span>
                </Label>
                <Input
                  required
                  value={form.nip}
                  onChange={(e) => setForm({ ...form, nip: e.target.value })}
                  placeholder="Masukkan NIP Anda"
                  className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl h-12 px-4 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Nama Lengkap <span className="text-red-600">*</span>
                </Label>
                <Input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Masukkan nama lengkap Anda"
                  className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl h-12 px-4 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Jabatan */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Jabatan <span className="text-red-600">*</span>
                </Label>
                <Input
                  required
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="Jabatan Anda"
                  className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl h-12 px-4 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Signature Pad */}
              <SignaturePad onSave={setSignature} />

              {/* Submit Button */}
              <Button
                onClick={handleSubmitClick}
                disabled={submitting || !form.nip || !form.full_name || !form.position || !signature}
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
                <span className="text-red-600">*</span> Wajib diisi
              </p>
            </div>
          </Card>
        </main>
      </div>
    </>
  )
}