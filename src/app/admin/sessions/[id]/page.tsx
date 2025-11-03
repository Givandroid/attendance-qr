'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Session, Attendance } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import QRCodeDisplay from '@/components/shared/QRCodeDisplay'
import { exportToPDF } from '@/lib/export-utils'
import { Edit } from 'lucide-react'
import {
  ArrowLeft,
  Users,
  Download,
  FileText,
  Calendar,
  MapPin,
  Clock,
  XCircle,
  CheckCircle,
  Activity,
  AlertTriangle
} from 'lucide-react'

// Custom Confirmation Modal Component
function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'danger' 
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'success'
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${iconBg}`}>
          {type === 'success' ? (
            <CheckCircle className={`w-6 h-6 ${iconColor}`} />
          ) : type === 'danger' ? (
            <XCircle className={`w-6 h-6 ${iconColor}`} />
          ) : (
            <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
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

export default function SessionMonitorPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean
    action: 'close' | 'open' | null
  }>({
    isOpen: false,
    action: null
  })

  useEffect(() => {
    let channel: any = null

    const init = async () => {
      // Fetch data first (parallel queries)
      await fetchSessionData()
      
      channel = supabase
        .channel('attendances-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'attendances',
            filter: `session_id=eq.${params.id}`
          },
          (payload) => {
            setAttendances(prev => [...prev, payload.new as Attendance])
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [params.id])

  const fetchSessionData = async () => {
    try {
      const [sessionResult, attendanceResult] = await Promise.all([
        supabase
          .from('sessions')
          .select('*')
          .eq('id', params.id)
          .single(),
        supabase
          .from('attendances')
          .select('*')
          .eq('session_id', params.id)
          .order('checked_in_at', { ascending: true })
      ])

      if (sessionResult.error) throw sessionResult.error
      if (attendanceResult.error) throw attendanceResult.error

      setSession(sessionResult.data)
      setAttendances(attendanceResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('❌ Gagal memuat data sesi')
    } finally {
      setLoading(false)
    }
  }

  const toggleSessionStatus = async () => {
    if (!session) return

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_active: !session.is_active })
        .eq('id', session.id)

      if (error) throw error

      setSession({ ...session, is_active: !session.is_active })
    } catch (error) {
      alert('❌ Gagal mengubah status sesi')
    }
  }

  const handleStatusToggle = () => {
    if (!session) return
    setStatusModal({
      isOpen: true,
      action: session.is_active ? 'close' : 'open'
    })
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

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 sm:p-12 text-center border-0 shadow-xl rounded-3xl max-w-md">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Sesi tidak ditemukan</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Sesi yang Anda cari tidak ada atau telah dihapus</p>
          <Button
            onClick={() => router.push('/admin')}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl w-full sm:w-auto"
          >
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const formatSessionDate = () => {
    return new Date(session.session_date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  return (
    <>
      {/* Modal Konfirmasi */}
      <ConfirmModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, action: null })}
        onConfirm={toggleSessionStatus}
        title={statusModal.action === 'close' ? 'Tutup Sesi?' : 'Buka Sesi Kembali?'}
        message={
          statusModal.action === 'close'
            ? 'Setelah sesi ditutup, peserta tidak dapat lagi melakukan absensi. Anda masih dapat membuka kembali sesi ini nanti.'
            : 'Sesi akan dibuka kembali dan peserta dapat melakukan absensi. QR Code akan aktif kembali.'
        }
        confirmText={statusModal.action === 'close' ? 'Ya, Tutup Sesi' : 'Ya, Buka Sesi'}
        cancelText="Batal"
        type={statusModal.action === 'close' ? 'danger' : 'success'}
      />

      {/* Header - Fixed Sticky with Transparent Background */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Header */}
          <div className="sm:hidden space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
              className="border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:scale-105 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Kembali
            </Button>
            
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">Monitor Sesi</h1>
              <p className="text-xs text-gray-500 truncate">Real-time attendance tracking</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/admin/sessions/${params.id}/edit`)}
                variant="outline"
                size="sm"
                className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 hover:scale-105 rounded-xl transition-all duration-300 flex-1 min-w-0"
              >
                <Edit className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">Edit</span>
              </Button>
              
              <Button
                onClick={handleStatusToggle}
                size="sm"
                className={`${
                  session.is_active
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30'
                    : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30'
                } text-white rounded-xl hover:scale-105 transition-all duration-300 flex-1 min-w-0`}
              >
                {session.is_active ? (
                  <>
                    <XCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="truncate">Tutup</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="truncate">Buka</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between">
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
                <h1 className="text-xl font-semibold text-gray-900">Monitor Sesi</h1>
                <p className="text-sm text-gray-500">Real-time attendance tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push(`/admin/sessions/${params.id}/edit`)}
                variant="outline"
                className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Sesi
              </Button>
              
              <Button
                onClick={handleStatusToggle}
                className={`${
                  session.is_active
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30'
                    : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30'
                } text-white rounded-xl hover:scale-105 transition-all duration-300`}
              >
                {session.is_active ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Tutup Sesi
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Buka Sesi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with padding top for fixed header */}
      <div className="min-h-screen bg-gray-50 overflow-x-hidden pt-[140px] sm:pt-[88px]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-x-hidden">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {/* Left Sidebar */}
          <div className="space-y-4 sm:space-y-6 w-full min-w-0">
            {/* Session Info Card */}
            <Card className="p-4 sm:p-6 border border-gray-200 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-gray-900 truncate">Informasi Sesi</h3>
                    <Badge
                      className={`${
                        session.is_active
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      } border px-2 sm:px-3 py-1 rounded-lg font-medium text-xs sm:text-sm flex-shrink-0`}
                    >
                      {session.is_active ? 'Aktif' : 'Ditutup'}
                    </Badge>
                  </div>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 break-words">
                {session.title}
              </h2>

              <div className="space-y-3">
                {session.description && (
                  <div className="pb-3 border-b border-gray-100">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Deskripsi</p>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">{session.description}</p>
                  </div>
                )}

                {session.location && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Lokasi</p>
                      <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">{session.location}</p>
                    </div>
                  </div>
                )}

                {/* Tanggal */}
                <div className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Tanggal</p>
                    <p className="text-sm sm:text-base text-gray-900 font-semibold break-words">
                      {formatSessionDate()}
                    </p>
                  </div>
                </div>

                {/* Waktu Mulai */}
                <div className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Waktu Mulai</p>
                    <p className="text-sm sm:text-base text-gray-900 font-semibold">
                      {formatTime(session.start_time)}
                    </p>
                  </div>
                </div>

                {/* Waktu Selesai */}
                {session.end_time && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Waktu Selesai</p>
                      <p className="text-sm sm:text-base text-gray-900 font-semibold">
                        {formatTime(session.end_time)} 
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-4 sm:p-6 border border-gray-200 rounded-2xl bg-white hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Peserta</p>
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">{attendances.length}</p>
                </div>
              </div>
              {attendances.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                  <Activity className="w-4 h-4 text-green-600 animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium text-green-700">Real-time updates aktif</span>
                </div>
              )}
            </Card>

            {/* QR Code */}
            {session.is_active && (
              <div className="w-full overflow-hidden">
                <QRCodeDisplay 
                  url={session.qr_code} 
                  title={session.title}
                  sessionData={{
                    date: formatSessionDate(),
                    time: `${formatTime(session.start_time)}${session.end_time ? ` - ${formatTime(session.end_time)}` : ''}`,
                    location: session.location
                  }}
                />
              </div>
            )}

            {/* Export Card */}
            <Card className="p-4 sm:p-6 border border-gray-200 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Export Laporan</h3>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => exportToPDF(session, attendances)}
                  disabled={attendances.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
              
              {attendances.length === 0 && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Belum ada data untuk di-export
                </p>
              )}
            </Card>
          </div>

          {/* Main Content - Attendance List */}
          <div className="lg:col-span-2 w-full min-w-0">
            <Card className="p-4 sm:p-6 border border-gray-200 rounded-2xl w-full">
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">Daftar Hadir</h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{attendances.length} peserta terdaftar</p>
                  </div>
                </div>
                {attendances.length > 0 && (
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-green-50 rounded-lg border border-green-200 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-700">Live</span>
                  </div>
                )}
              </div>

              {attendances.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    Belum ada peserta
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
                    Peserta yang melakukan absensi akan muncul di sini secara real-time
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] sm:max-h-[700px] overflow-y-auto pr-1 sm:pr-2 w-full">
                  {attendances.map((att, index) => (
                    <Card
                      key={att.id}
                      className="p-4 sm:p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-xl group w-full"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 w-full">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                          <span className="font-bold text-blue-600 group-hover:text-white transition-colors">
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 w-full">
                          <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-3 group-hover:text-blue-600 transition-colors break-words">
                            {att.full_name}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm w-full">
                            <div className="min-w-0">
                              <span className="text-gray-500">Instansi:</span>
                              <p className="text-gray-900 font-medium break-words">{att.institution}</p>
                            </div>
                            <div className="min-w-0">
                              <span className="text-gray-500">Jabatan:</span>
                              <p className="text-gray-900 font-medium break-words">{att.position}</p>
                            </div>
                            <div className="min-w-0">
                              <span className="text-gray-500">No. Telepon:</span>
                              <p className="text-gray-900 font-medium break-words">{att.phone_number}</p>
                            </div>
                            <div className="min-w-0">
                              <span className="text-gray-500">Waktu Absen:</span>
                              <p className="text-gray-900 font-medium">
                                {new Date(att.checked_in_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Signature untuk mobile */}
                          {att.signature && (
                            <div className="mt-3 sm:hidden w-full">
                              <p className="text-xs text-gray-500 mb-2">Tanda Tangan</p>
                              <div className="w-full max-w-[200px]">
                                <img
                                  src={att.signature}
                                  alt="Signature"
                                  className="w-full h-16 object-contain border-2 border-gray-200 rounded-lg bg-gray-50"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Signature untuk desktop */}
                        {att.signature && (
                          <div className="hidden sm:block flex-shrink-0">
                            <p className="text-xs text-gray-500 mb-2 text-center">Tanda Tangan</p>
                            <img
                              src={att.signature}
                              alt="Signature"
                              className="w-32 h-20 object-contain border-2 border-gray-200 rounded-lg bg-gray-50 hover:border-blue-300 transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      </div>
    </>
  )
}